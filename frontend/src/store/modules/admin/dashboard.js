import { api } from '@/boot/axios';

export default {
  namespaced: true,

  state: () => ({
    stats: {
      auditsCount: 0,
      usersCount: 0,
      templatesCount: 0,
      locationsCount: 0,
    },
    loading: false,
  }),

  getters: {
    stats: state => state.stats,
    loading: state => state.loading,
  },

  mutations: {
    SET_STATS(state, payload) {
      state.stats = payload;
    },
    SET_LOADING(state, payload) {
      state.loading = payload;
    },
  },

  actions: {
    async fetchStats({ commit }) {
      try {
        commit('SET_LOADING', true);
        const { data } = await api.get('/api/dashboard/stats');
        commit('SET_STATS', data);
        return data;
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
  },
};
