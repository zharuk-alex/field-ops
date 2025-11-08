import { api } from '@/boot/axios';

export default {
  namespaced: true,

  state: () => ({
    companies: [],
    pagination: { total: 0, page: 1, limit: 10, pages: 0 },
  }),

  getters: {
    companies: state => state.companies,
    pagination: state => state.pagination,
  },

  mutations: {
    companies(state, payload) {
      state.companies = payload;
    },
    pagination(state, payload) {
      state.pagination = payload;
    },
  },

  actions: {
    async getCompanies(
      { commit },
      {
        page = 1,
        limit = 10,
        sortBy = null,
        order = 'asc',
        search = null,
      } = {},
    ) {
      try {
        const params = { page, limit };
        if (sortBy) params.sortBy = sortBy;
        if (order) params.order = order;
        if (search) params.search = search;

        const result = await api.get('/api/companies/', { params });
        const { items = [], meta = {} } = result?.data ?? {};

        commit('companies', items);

        commit('pagination', {
          total: meta.total ?? 0,
          page: meta.page ?? page,
          limit: meta.limit ?? limit,
          pages:
            meta.pages ?? Math.ceil((meta.total ?? 0) / (meta.limit ?? limit)),
        });
      } catch (error) {
        console.error('getCompanies error', error);
        throw error;
      }
    },

    async createCompany(_, { form = {} }) {
      return await api.post('/api/companies', { ...form });
    },
    async getCompany(_, id) {
      return await api.get(`/api/companies/${id}`);
    },
    async updateCompany(_, { id, form = {} }) {
      return await api.put(`/api/companies/${id}`, { ...form });
    },
    async removeCompany(_, id) {
      return await api.delete(`/api/companies/${id}`);
    },
  },
};
