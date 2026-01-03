import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { v4 as uuidv4 } from 'uuid';
import { Pool } from 'pg';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const app = express();
const PORT = process.env.PORT || 3340;

// Configuration
const config = {
  keycloak: {
    realm: process.env.KEYCLOAK_REALM || 'RegistryAdmin',
    url: process.env.KEYCLOAK_URL || 'https://keycloak.healthflow.tech',
  },
  identity: {
    url: process.env.IDENTITY_SERVICE_URL || 'https://identity.healthflow.tech',
  },
  registry: {
    url: process.env.REGISTRY_URL || 'https://registry.healthflow.tech',
  },
  requestExpiryMinutes: parseInt(process.env.REQUEST_EXPIRY_MINUTES || '15'),
};

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://healthflow:HiZCllteZjDFGHsmCrrBfDVY@localhost:5432/signing',
});

// JWKS client for Keycloak token verification
const jwks = jwksClient({
  jwksUri: `${config.keycloak.url}/realms/${config.keycloak.realm}/protocol/openid-connect/certs`,
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Types
interface SigningRequest {
  id: string;
  professional_id: string;
  professional_did: string;
  document_type: string;
  document_hash: string;
  document_payload: object;
  requester_id: string;
  requester_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  created_at: Date;
  expires_at: Date;
  signed_document?: object;
  rejection_reason?: string;
}

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    preferred_username: string;
    realm_access?: { roles: string[] };
  };
}

// JWT verification middleware
const verifyToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);
  
  try {
    const getKey = (header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) => {
      jwks.getSigningKey(header.kid, (err, key) => {
        if (err) {
          callback(err);
        } else {
          const signingKey = key?.getPublicKey();
          callback(null, signingKey);
        }
      });
    };

    jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      req.user = decoded as AuthenticatedRequest['user'];
      next();
    });
  } catch (error) {
    return res.status(401).json({ error: 'Token verification failed' });
  }
};

// Initialize database tables
async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS signing_requests (
        id UUID PRIMARY KEY,
        professional_id VARCHAR(255) NOT NULL,
        professional_did VARCHAR(500) NOT NULL,
        document_type VARCHAR(100) NOT NULL,
        document_hash VARCHAR(64) NOT NULL,
        document_payload JSONB NOT NULL,
        requester_id VARCHAR(255) NOT NULL,
        requester_name VARCHAR(255) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        signed_document JSONB,
        rejection_reason TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_signing_requests_professional ON signing_requests(professional_id);
      CREATE INDEX IF NOT EXISTS idx_signing_requests_status ON signing_requests(status);
      CREATE INDEX IF NOT EXISTS idx_signing_requests_expires ON signing_requests(expires_at);
      
      CREATE TABLE IF NOT EXISTS signing_history (
        id UUID PRIMARY KEY,
        signing_request_id UUID REFERENCES signing_requests(id),
        professional_id VARCHAR(255) NOT NULL,
        action VARCHAR(20) NOT NULL,
        action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(45),
        device_info TEXT,
        biometric_verified BOOLEAN DEFAULT false
      );
    `);
    console.log('Database tables initialized');
  } finally {
    client.release();
  }
}

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'healthflow-signing-service', version: '1.0.0' });
});

// Create signing request (called by external systems like hospitals)
app.post('/api/v1/signing-requests', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { professional_id, professional_did, document_type, document_payload, requester_name } = req.body;
    
    if (!professional_id || !professional_did || !document_type || !document_payload) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = uuidv4();
    const document_hash = require('crypto').createHash('sha256').update(JSON.stringify(document_payload)).digest('hex');
    const expires_at = new Date(Date.now() + config.requestExpiryMinutes * 60 * 1000);
    
    const result = await pool.query(
      `INSERT INTO signing_requests 
       (id, professional_id, professional_did, document_type, document_hash, document_payload, requester_id, requester_name, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [id, professional_id, professional_did, document_type, document_hash, document_payload, req.user?.sub, requester_name || 'Unknown']
    );

    // TODO: Send push notification to professional's mobile app
    
    res.status(201).json({
      id: result.rows[0].id,
      status: 'pending',
      expires_at: result.rows[0].expires_at,
      message: 'Signing request created successfully'
    });
  } catch (error) {
    console.error('Error creating signing request:', error);
    res.status(500).json({ error: 'Failed to create signing request' });
  }
});

// Get pending signing requests for a professional (mobile app)
app.get('/api/v1/signing-requests', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const professional_id = req.query.professional_id || req.user?.sub;
    const status = req.query.status || 'pending';
    
    // Update expired requests
    await pool.query(
      `UPDATE signing_requests SET status = 'expired' WHERE status = 'pending' AND expires_at < NOW()`
    );
    
    const result = await pool.query(
      `SELECT id, professional_id, document_type, document_hash, requester_name, status, created_at, expires_at
       FROM signing_requests 
       WHERE professional_id = $1 AND status = $2
       ORDER BY created_at DESC
       LIMIT 50`,
      [professional_id, status]
    );

    res.json({
      requests: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching signing requests:', error);
    res.status(500).json({ error: 'Failed to fetch signing requests' });
  }
});

// Get signing request details
app.get('/api/v1/signing-requests/:id', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT * FROM signing_requests WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Signing request not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching signing request:', error);
    res.status(500).json({ error: 'Failed to fetch signing request' });
  }
});

// Approve and sign request (mobile app)
app.post('/api/v1/signing-requests/:id/approve', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { biometric_verified, device_info } = req.body;
    
    if (!biometric_verified) {
      return res.status(400).json({ error: 'Biometric verification required' });
    }

    // Get the signing request
    const requestResult = await pool.query(
      `SELECT * FROM signing_requests WHERE id = $1 AND status = 'pending'`,
      [id]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ error: 'Signing request not found or already processed' });
    }

    const signingRequest = requestResult.rows[0];
    
    // Check if expired
    if (new Date(signingRequest.expires_at) < new Date()) {
      await pool.query(`UPDATE signing_requests SET status = 'expired' WHERE id = $1`, [id]);
      return res.status(400).json({ error: 'Signing request has expired' });
    }

    // Call Identity Service to sign the document
    try {
      const signResponse = await axios.post(`${config.identity.url}/utils/sign`, {
        DID: signingRequest.professional_did,
        payload: signingRequest.document_payload
      });

      const signedDocument = signResponse.data;

      // Update the signing request
      await pool.query(
        `UPDATE signing_requests 
         SET status = 'approved', signed_document = $1, updated_at = NOW()
         WHERE id = $2`,
        [signedDocument, id]
      );

      // Record in history
      await pool.query(
        `INSERT INTO signing_history (id, signing_request_id, professional_id, action, ip_address, device_info, biometric_verified)
         VALUES ($1, $2, $3, 'approved', $4, $5, $6)`,
        [uuidv4(), id, signingRequest.professional_id, req.ip, device_info, biometric_verified]
      );

      res.json({
        status: 'approved',
        signed_document: signedDocument,
        message: 'Document signed successfully'
      });
    } catch (signError: any) {
      console.error('Error signing document:', signError.response?.data || signError.message);
      res.status(500).json({ error: 'Failed to sign document', details: signError.response?.data });
    }
  } catch (error) {
    console.error('Error approving signing request:', error);
    res.status(500).json({ error: 'Failed to approve signing request' });
  }
});

// Reject signing request (mobile app)
app.post('/api/v1/signing-requests/:id/reject', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, device_info } = req.body;

    const requestResult = await pool.query(
      `SELECT * FROM signing_requests WHERE id = $1 AND status = 'pending'`,
      [id]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ error: 'Signing request not found or already processed' });
    }

    const signingRequest = requestResult.rows[0];

    // Update the signing request
    await pool.query(
      `UPDATE signing_requests 
       SET status = 'rejected', rejection_reason = $1, updated_at = NOW()
       WHERE id = $2`,
      [reason || 'No reason provided', id]
    );

    // Record in history
    await pool.query(
      `INSERT INTO signing_history (id, signing_request_id, professional_id, action, ip_address, device_info, biometric_verified)
       VALUES ($1, $2, $3, 'rejected', $4, $5, false)`,
      [uuidv4(), id, signingRequest.professional_id, req.ip, device_info]
    );

    res.json({
      status: 'rejected',
      message: 'Signing request rejected'
    });
  } catch (error) {
    console.error('Error rejecting signing request:', error);
    res.status(500).json({ error: 'Failed to reject signing request' });
  }
});

// Get signing history for a professional
app.get('/api/v1/signing-history', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const professional_id = req.query.professional_id || req.user?.sub;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await pool.query(
      `SELECT sh.*, sr.document_type, sr.requester_name, sr.created_at as request_created_at
       FROM signing_history sh
       JOIN signing_requests sr ON sh.signing_request_id = sr.id
       WHERE sh.professional_id = $1
       ORDER BY sh.action_timestamp DESC
       LIMIT $2 OFFSET $3`,
      [professional_id, limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM signing_history WHERE professional_id = $1`,
      [professional_id]
    );

    res.json({
      history: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching signing history:', error);
    res.status(500).json({ error: 'Failed to fetch signing history' });
  }
});

// Get statistics for a professional
app.get('/api/v1/signing-stats', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const professional_id = req.query.professional_id || req.user?.sub;

    const result = await pool.query(
      `SELECT 
         COUNT(*) FILTER (WHERE status = 'approved') as total_signed,
         COUNT(*) FILTER (WHERE status = 'rejected') as total_rejected,
         COUNT(*) FILTER (WHERE status = 'pending') as total_pending,
         COUNT(*) FILTER (WHERE status = 'expired') as total_expired,
         COUNT(*) as total_requests
       FROM signing_requests 
       WHERE professional_id = $1`,
      [professional_id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching signing stats:', error);
    res.status(500).json({ error: 'Failed to fetch signing stats' });
  }
});

// Start server
async function start() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`HealthFlow Signing Service running on port ${PORT}`);
    console.log(`Keycloak: ${config.keycloak.url}/realms/${config.keycloak.realm}`);
    console.log(`Identity Service: ${config.identity.url}`);
  });
}

start().catch(console.error);
