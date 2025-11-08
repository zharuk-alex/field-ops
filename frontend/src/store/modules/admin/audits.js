import { api } from '@/boot/axios';

export default {
  namespaced: true,

  state: () => ({
    audits: [],
    currentAudit: null,
    pagination: { total: 0, page: 1, limit: 10, pages: 0 },
  }),

  getters: {
    audits: state => state.audits,
    currentAudit: state => state.currentAudit,
    pagination: state => state.pagination,
  },

  mutations: {
    audits(state, payload) {
      state.audits = payload;
    },
    currentAudit(state, payload) {
      state.currentAudit = payload;
    },
    pagination(state, payload) {
      state.pagination = payload;
    },
  },

  actions: {
    async getAudits(
      { commit },
      {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        order = 'desc',
        companyId = null,
        locationId = null,
        assigneeId = null,
        status = null,
        search = null,
      } = {},
    ) {
      try {
        const params = { page, limit, sortBy, order };
        if (companyId) {
          params.companyId = companyId;
        }
        if (locationId) {
          params.locationId = locationId;
        }
        if (assigneeId) {
          params.assigneeId = assigneeId;
        }
        if (status) {
          params.status = status;
        }
        if (search) {
          params.search = search;
        }

        const result = await api.get('/api/audits', { params });
        const { items = [], meta = {} } = result?.data ?? {};

        commit('audits', items);
        commit('pagination', {
          total: meta.total ?? 0,
          page: meta.page ?? page,
          limit: meta.limit ?? limit,
          pages:
            meta.pages ?? Math.ceil((meta.total ?? 0) / (meta.limit ?? limit)),
        });

        return result.data;
      } catch (error) {
        console.error('getAudits error', error);
        throw error;
      }
    },

    async getAudit({ commit }, id) {
      try {
        const result = await api.get(`/api/audits/${id}`);
        commit('currentAudit', result.data);
        return result.data;
      } catch (error) {
        console.error('getAudit error', error);
        throw error;
      }
    },

    async createAudit(_, { form = {} }) {
      try {
        return await api.post('/api/audits', { ...form });
      } catch (error) {
        console.error('createAudit error', error);
        throw error;
      }
    },

    async updateAudit(_, { id, form = {} }) {
      try {
        return await api.put(`/api/audits/${id}`, { ...form });
      } catch (error) {
        console.error('updateAudit error', error);
        throw error;
      }
    },
  },
};
