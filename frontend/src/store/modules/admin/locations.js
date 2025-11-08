import { api } from '@/boot/axios';

export default {
  namespaced: true,

  state: () => ({
    locations: [],
    pagination: { total: 0, page: 1, limit: 10, pages: 0 },
  }),

  getters: {
    locations: state => state.locations,
    pagination: state => state.pagination,
  },

  mutations: {
    locations(state, payload) {
      state.locations = payload;
    },
    pagination(state, payload) {
      state.pagination = payload;
    },
  },

  actions: {
    async getLocations(
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

        const result = await api.get('/api/locations/', { params });
        const { items = [], meta = {} } = result?.data ?? {};

        commit('locations', items);

        commit('pagination', {
          total: meta.total ?? 0,
          page: meta.page ?? page,
          limit: meta.limit ?? limit,
          pages:
            meta.pages ?? Math.ceil((meta.total ?? 0) / (meta.limit ?? limit)),
        });
      } catch (error) {
        console.error('getLocations error', error);
        throw error;
      }
    },

    async createLocation(_, { form = {} }) {
      return await api.post('/api/locations', { ...form });
    },
    async getLocation(_, id) {
      return await api.get(`/api/locations/${id}`);
    },
    async updateLocation(_, { id, form = {} }) {
      return await api.put(`/api/locations/${id}`, { ...form });
    },
    async removeLocation(_, id) {
      return await api.delete(`/api/locations/${id}`);
    },
  },
};
