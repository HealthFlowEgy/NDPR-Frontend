import { fetchUtils, DataProvider } from 'react-admin';

const apiUrl = process.env.REACT_APP_API_URL || 'https://registry.healthflow.tech/api/v1';

const httpClient = async (url: string, options: fetchUtils.Options = {}) => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json' });
  }
  (options.headers as Headers).set('Content-Type', 'application/json');
  
  console.log('HTTP Request:', url, options.method || 'GET', options.body);
  
  try {
    const response = await fetchUtils.fetchJson(url, options);
    console.log('HTTP Response:', response.json);
    return response;
  } catch (error) {
    console.error('HTTP Error:', error);
    throw error;
  }
};

const sunbirdRcDataProvider: DataProvider = {
  getList: async (resource: string, params: any) => {
    const page = params.pagination?.page || 1;
    const perPage = params.pagination?.perPage || 10;
    
    console.log('getList called for:', resource, 'params:', params);
    
    try {
      const { json } = await httpClient(`${apiUrl}/${resource}/search`, {
        method: 'POST',
        body: JSON.stringify({
          offset: (page - 1) * perPage,
          limit: perPage,
          filters: params.filter || {}
        }),
      });
      
      console.log('getList raw response:', json);
      
      // Sunbird RC returns { data: [...], totalCount: n }
      const data = json.data || (Array.isArray(json) ? json : []);
      const totalCount = json.totalCount || data.length;
      
      const mappedData = data.map((item: any) => ({ ...item, id: item.osid || item.id }));
      console.log('getList mapped data:', mappedData);
      
      return {
        data: mappedData,
        total: totalCount > 0 ? totalCount : (data.length >= perPage ? page * perPage + 1 : (page - 1) * perPage + data.length),
      };
    } catch (error) {
      console.error('getList search error:', error);
      try {
        const { json } = await httpClient(`${apiUrl}/${resource}`);
        const data = json.data || (Array.isArray(json) ? json : [json]);
        return {
          data: data.map((item: any) => ({ ...item, id: item.osid || item.id })),
          total: data.length,
        };
      } catch (e) {
        console.error('getList fallback error:', e);
        return { data: [], total: 0 };
      }
    }
  },

  getOne: async (resource: string, params: any) => {
    console.log('getOne called for:', resource, 'id:', params.id);
    const { json } = await httpClient(`${apiUrl}/${resource}/${params.id}`);
    return {
      data: { ...json, id: json.osid || json.id || params.id },
    };
  },

  getMany: async (resource: string, params: any) => {
    console.log('getMany called for:', resource, 'ids:', params.ids);
    const responses = await Promise.all(
      params.ids.map((id: any) => httpClient(`${apiUrl}/${resource}/${id}`))
    );
    return {
      data: responses.map(({ json }) => ({ ...json, id: json.osid || json.id })),
    };
  },

  getManyReference: async (resource: string, params: any) => {
    const page = params.pagination?.page || 1;
    const perPage = params.pagination?.perPage || 10;
    
    console.log('getManyReference called for:', resource, 'params:', params);
    
    try {
      const { json } = await httpClient(`${apiUrl}/${resource}/search`, {
        method: 'POST',
        body: JSON.stringify({
          offset: (page - 1) * perPage,
          limit: perPage,
          filters: { [params.target]: params.id, ...params.filter },
        }),
      });
      
      const data = json.data || (Array.isArray(json) ? json : []);
      return {
        data: data.map((item: any) => ({ ...item, id: item.osid || item.id })),
        total: json.totalCount || data.length,
      };
    } catch (error) {
      console.error('getManyReference error:', error);
      return { data: [], total: 0 };
    }
  },

  create: async (resource: string, params: any) => {
    // Remove any undefined or null values and the id field
    const cleanData = Object.fromEntries(
      Object.entries(params.data).filter(([key, value]) => 
        value !== undefined && value !== null && value !== '' && key !== 'id'
      )
    );
    
    console.log('create called for:', resource, 'with data:', cleanData);
    
    const { json } = await httpClient(`${apiUrl}/${resource}`, {
      method: 'POST',
      body: JSON.stringify(cleanData),
    });
    
    console.log('create response:', json);
    
    // Sunbird RC returns { result: { Doctor: { osid: "..." } } }
    const osid = json.result?.[resource]?.osid || json.result?.osid || json.osid || json.id;
    
    return {
      data: { ...cleanData, id: osid } as any,
    };
  },

  update: async (resource: string, params: any) => {
    // Remove any undefined or null values and internal fields
    const cleanData = Object.fromEntries(
      Object.entries(params.data).filter(([key, value]) => 
        value !== undefined && value !== null && 
        !key.startsWith('os') && key !== 'id'
      )
    );
    
    console.log('update called for:', resource, 'id:', params.id, 'with data:', cleanData);
    
    await httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(cleanData),
    });
    return {
      data: { ...params.data, id: params.id } as any,
    };
  },

  updateMany: async (resource: string, params: any) => {
    console.log('updateMany called for:', resource, 'ids:', params.ids);
    await Promise.all(
      params.ids.map((id: any) =>
        httpClient(`${apiUrl}/${resource}/${id}`, {
          method: 'PUT',
          body: JSON.stringify(params.data),
        })
      )
    );
    return { data: params.ids };
  },

  delete: async (resource: string, params: any) => {
    console.log('delete called for:', resource, 'id:', params.id);
    await httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: 'DELETE',
    });
    return { data: params.previousData as any };
  },

  deleteMany: async (resource: string, params: any) => {
    console.log('deleteMany called for:', resource, 'ids:', params.ids);
    await Promise.all(
      params.ids.map((id: any) =>
        httpClient(`${apiUrl}/${resource}/${id}`, {
          method: 'DELETE',
        })
      )
    );
    return { data: params.ids };
  },
};

export default sunbirdRcDataProvider;
