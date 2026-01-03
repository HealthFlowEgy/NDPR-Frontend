import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'wallet', 
    loadComponent: () => import('./wallet/wallet.component').then(m => m.WalletComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'credentials', 
    loadComponent: () => import('./credentials/credentials.component').then(m => m.CredentialsComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'signing', 
    loadComponent: () => import('./signing/signing.component').then(m => m.SigningComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'settings', 
    loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '' }
];
