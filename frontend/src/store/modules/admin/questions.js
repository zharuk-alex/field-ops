import { api } from '@/boot/axios';

export default {
  namespaced: true,

  state: () => ({
    questions: [],
    pagination: { total: 0, page: 1, limit: 10, pages: 0 },
  }),

  getters: {
    questions: state => state.questions,
    pagination: state => state.pagination,
  },

  mutations: {
    questions(state, payload) {
      state.questions = payload;
    },
    pagination(state, payload) {
      state.pagination = payload;
    },
  },

  actions: {
    async getQuestions(
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

        const result = await api.get('/api/questions/', { params });
        const { items = [], meta = {} } = result?.data ?? {};

        commit('questions', items);

        commit('pagination', {
          total: meta.total ?? 0,
          page: meta.page ?? page,
          limit: meta.limit ?? limit,
          pages:
            meta.pages ?? Math.ceil((meta.total ?? 0) / (meta.limit ?? limit)),
        });
      } catch (error) {
        console.error('getQuestions error', error);
        throw error;
      }
    },

    async createQuestion(_, { form = {} }) {
      return await api.post('/api/questions', { ...form });
    },
    async getQuestion(_, id) {
      return await api.get(`/api/questions/${id}`);
    },
    async updateQuestion(_, { id, form = {} }) {
      return await api.put(`/api/questions/${id}`, { ...form });
    },
    async removeQuestion(_, id) {
      return await api.delete(`/api/questions/${id}`);
    },
  },
};
