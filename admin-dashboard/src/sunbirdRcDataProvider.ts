import { fetchUtils } from 'react-admin';

const apiUrl = process.env.REACT_APP_API_URL || 'https://registry.healthflow.tech/api/v1';

const httpClient = (url: string, options: fetchUtils.Options = {}) => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json' });
  }
  (options.headers as Headers).set('Content-Type', 'application/json');
  return fetchUtils.fetchJson(url, options);
};

const sunbirdRcDataProvider = {
  getList: async (resource: string, params: any) => {
    const page = params.pagination?.page || 1;
    const perPage = params.pagination?.perPage || 10;
    
    try {
      const { json } = await httpClient(`${apiUrl}/${resource}/search`, {
        method: 'POST',
        body: JSON.stringify({
          offset: (page - 1) * perPage,
          limit: perPage,
          filters: params.filter || {}
        }),
      });
      
      const data = Array.isArray(json) ? json : [];
      return {
        data: data.map((item: any) => ({ ...item, id: item.osid || item.id })),
        total: data.length >= perPage ? page * perPage + 1 : (page - 1) * perPage + data.length,
      };
    } catch (error) {
      try {
        const { json } = await httpClient(`${apiUrl}/${resource}`);
        const data = Array.isArray(json) ? json : [json];
        return {
          data: data.map((item: any) => ({ ...item, id: item.osid || item.id })),
          total: data.length,
        };
      } catch (e) {
        return { data: [], total: 0 };
      }
    }
  },

  getOne: async (resource: string, params: any) => {
    const { json } = await httpClient(`${apiUrl}/${resource}/${params.id}`);
    return {
      data: { ...json, id: json.osid || json.id || params.id },
    };
  },

  getMany: async (resource: string, params: any) => {
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
    
    try {
      const { json } = await httpClient(`${apiUrl}/${resource}/search`, {
        method: 'POST',
        body: JSON.stringify({
          offset: (page - 1) * perPage,
          limit: perPage,
          filters: { [params.target]: params.id, ...params.filter },
        }),
      });
      
      const data = Array.isArray(json) ? json : [];
      return {
        data: data.map((item: any) => ({ ...item, id: item.osid || item.id })),
        total: data.length,
      };
    } catch (error) {
      return { data: [], total: 0 };
    }
  },

  create: async (resource: string, params: any) => {
    const { json } = await httpClient(`${apiUrl}/${resource}`, {
      method: 'POST',
      body: JSON.stringify(params.data),
    });
    return {
      data: { ...params.data, id: json.result?.osid || json.osid || json.id },
    };
  },

  update: async (resource: string, params: any) => {
    await httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    });
    return {
      data: { ...params.data, id: params.id },
    };
  },

  updateMany: async (resource: string, params: any) => {
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
    await httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: 'DELETE',
    });
    return { data: params.previousData };
  },

  deleteMany: async (resource: string, params: any) => {
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
