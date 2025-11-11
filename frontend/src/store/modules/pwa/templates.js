import { api } from '@/boot/axios';
import { templatesTable } from '@/boot/db';

export default {
  namespaced: true,

  state: () => ({
    templates: [],
    loading: false,
    hydrated: false,
  }),

  getters: {
    templates: state => state.templates,
    loading: state => state.loading,
    hydrated: state => state.hydrated,
  },

  mutations: {
    setTemplates(state, payload) {
      state.templates = payload;
    },
    setLoading(state, payload) {
      state.loading = payload;
    },
    setHydrated(state, payload) {
      state.hydrated = payload;
    },
  },

  actions: {
    async hydrateFromDB({ commit }) {
      try {
        const templates = await templatesTable.toArray();
        if (templates.length > 0) {
          commit('setTemplates', templates);
          commit('setHydrated', true);
        }
        return templates;
      } catch (error) {
        console.error('hydrateFromDB error', error);
        return [];
      }
    },

    async getTemplates({ commit }, { forceRefresh = false } = {}) {
      try {
        commit('setLoading', true);

        if (!forceRefresh) {
          const cached = await templatesTable.toArray();
          if (cached.length > 0) {
            commit('setTemplates', cached);
            commit('setHydrated', true);
            return cached;
          }
        }

        const result = await api.get('/api/pwa/templates');
        const { templates = [] } = result?.data ?? {};

        await templatesTable.clear();
        await templatesTable.bulkAdd(templates);

        commit('setTemplates', templates);
        commit('setHydrated', true);

        return templates;
      } catch (error) {
        console.error('getTemplates error', error);

        const cached = await templatesTable.toArray();
        if (cached.length > 0) {
          commit('setTemplates', cached);
          commit('setHydrated', true);
          return cached;
        }

        throw error;
      } finally {
        commit('setLoading', false);
      }
    },

    async clearTemplates({ commit }) {
      await templatesTable.clear();
      commit('setTemplates', []);
      commit('setHydrated', false);
    },

    async getTemplateById({ state }, templateId) {
      try {
        let template = state.templates.find(t => t.id === templateId);

        if (!template) {
          template = await templatesTable.get(templateId);
        }

        return template || null;
      } catch (error) {
        console.error('getTemplateById error', error);
        return null;
      }
    },
  },
};
