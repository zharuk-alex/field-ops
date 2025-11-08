import { LocalStorage } from 'quasar';

const STORAGE_KEY = 'pwa_filters';

export default {
  namespaced: true,

  state: () => ({
    groupBy: 'location', // 'location' | 'template'
  }),

  getters: {
    groupBy: state => state.groupBy,
  },

  mutations: {
    setGroupBy(state, value) {
      state.groupBy = value;
      LocalStorage.set(STORAGE_KEY, { groupBy: value });
    },
    hydrateFilters(state, payload) {
      if (payload?.groupBy) {
        state.groupBy = payload.groupBy;
      }
    },
  },

  actions: {
    hydrateFromLocalStorage({ commit }) {
      try {
        const saved = LocalStorage.getItem(STORAGE_KEY);
        if (saved) {
          commit('hydrateFilters', saved);
        }
      } catch (error) {
        console.error('hydrateFromLocalStorage error', error);
      }
    },

    setGroupBy({ commit }, value) {
      commit('setGroupBy', value);
    },
  },
};
