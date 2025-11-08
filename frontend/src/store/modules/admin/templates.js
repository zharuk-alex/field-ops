import { api } from '@/boot/axios';

export default {
  namespaced: true,

  state: () => ({
    templates: [],
    pagination: { total: 0, page: 1, limit: 10, pages: 0 },
  }),

  getters: {
    templates: state => state.templates,
    pagination: state => state.pagination,
  },

  mutations: {
    templates(state, payload) {
      state.templates = payload;
    },
    pagination(state, payload) {
      state.pagination = payload;
    },
  },

  actions: {
    async getTemplates(
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

        const result = await api.get('/api/templates/', { params });
        const { items = [], meta = {} } = result?.data ?? {};

        commit('templates', items);

        commit('pagination', {
          total: meta.total ?? 0,
          page: meta.page ?? page,
          limit: meta.limit ?? limit,
          pages:
            meta.pages ?? Math.ceil((meta.total ?? 0) / (meta.limit ?? limit)),
        });
      } catch (error) {
        console.error('getTemplates error', error);
        throw error;
      }
    },
    async getTemplate(_, id) {
      return await api.get(`/api/templates/${id}`);
    },
    async createTemplate(_, { form = {} }) {
      return await api.post('/api/templates', { ...form });
    },
    async updateTemplate(_, { id, form = {} }) {
      return await api.put(`/api/templates/${id}`, { ...form });
    },
    async removeTemplate(_, id) {
      return await api.delete(`/api/templates/${id}`);
    },
  },
};
