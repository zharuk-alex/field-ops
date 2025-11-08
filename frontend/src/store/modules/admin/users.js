import { api } from '@/boot/axios';

export default {
  namespaced: true,

  state: () => ({
    users: [],
    pagination: { total: 0, page: 1, limit: 10, pages: 0 },
  }),

  getters: {
    users: state => state.users,
    pagination: state => state.pagination,
  },

  mutations: {
    users(state, payload) {
      state.users = payload;
    },
    pagination(state, payload) {
      state.pagination = payload;
    },
  },

  actions: {
    async getUsers(
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

        const result = await api.get('/api/users/', { params });
        const { items = [], meta = {} } = result?.data ?? {};

        commit('users', items);

        commit('pagination', {
          total: meta.total ?? 0,
          page: meta.page ?? page,
          limit: meta.limit ?? limit,
          pages:
            meta.pages ?? Math.ceil((meta.total ?? 0) / (meta.limit ?? limit)),
        });
      } catch (error) {
        console.error('getUsers error', error);
        throw error;
      }
    },
    async getUser(_, id) {
      return await api.get(`/api/users/${id}`);
    },
    async createUser(_, { form = {} }) {
      return await api.post('/api/users', { ...form });
    },
    async updateUser(_, { id, form = {} }) {
      return await api.put(`/api/users/${id}`, { ...form });
    },
    async removeUser(_, id) {
      return await api.delete(`/api/users/${id}`);
    },
  },
};
