import { api } from '@/boot/axios';
import { uid } from 'quasar';
import { auditsDataTable, photosTable } from '@/boot/db';

export default {
  namespaced: true,

  state: () => ({
    currentAudit: null,
    answers: {},
    loading: false,
    startedAt: null,
    startLocation: null,
    endLocation: null,
    hydrated: false,
  }),

  getters: {
    currentAudit: state => state.currentAudit,
    answers: state => state.answers,
    loading: state => state.loading,
    hydrated: state => state.hydrated,
    progress: state => {
      if (!state.currentAudit?.questions?.length) return 0;
      const total = state.currentAudit.questions.length;
      const answered = Object.keys(state.answers).length;
      return Math.round((answered / total) * 100);
    },
  },

  mutations: {
    setCurrentAudit(state, payload) {
      state.currentAudit = payload;
      if (!state.startedAt) {
        state.startedAt = new Date().toISOString();
      }
    },
    setAnswer(state, { questionId, value }) {
      state.answers = {
        ...state.answers,
        [questionId]: value,
      };
    },
    setAnswers(state, payload) {
      state.answers = payload;
    },
    setStartedAt(state, payload) {
      state.startedAt = payload;
    },
    clearAnswers(state) {
      state.answers = {};
    },
    setLoading(state, payload) {
      state.loading = payload;
    },
    setHydrated(state, payload) {
      state.hydrated = payload;
    },
    setStartLocation(state, payload) {
      state.startLocation = payload;
    },
    setEndLocation(state, payload) {
      state.endLocation = payload;
    },
    clearCurrentAudit(state) {
      state.currentAudit = null;
      state.answers = {};
      state.startedAt = null;
      state.startLocation = null;
      state.endLocation = null;
    },
  },

  actions: {
    async hydrateFromDB({ commit }) {
      try {
        const auditsData = await auditsDataTable.toArray();
        if (auditsData.length > 0) {
          const activeAudit = auditsData[0];
          commit('setCurrentAudit', activeAudit.audit);
          commit('setAnswers', activeAudit.answers || {});
          commit('setStartedAt', activeAudit.startedAt);
          if (activeAudit.startLocation) {
            commit('setStartLocation', activeAudit.startLocation);
          }
          if (activeAudit.endLocation) {
            commit('setEndLocation', activeAudit.endLocation);
          }
          commit('setHydrated', true);
          console.log(
            'Active audit hydrated from IndexedDB:',
            activeAudit.audit.localId,
          );
          return activeAudit;
        }
        commit('setHydrated', true);
        return null;
      } catch (error) {
        console.error('hydrateFromDB error', error);
        commit('setHydrated', true);
        return null;
      }
    },

    async loadAuditByLocalId({ commit }, localId) {
      try {
        commit('setLoading', true);
        const auditData = await auditsDataTable.get(localId);

        if (auditData) {
          commit('setCurrentAudit', auditData.audit);
          commit('setAnswers', auditData.answers || {});
          commit('setStartedAt', auditData.startedAt);
          console.log('Audit loaded from IndexedDB:', localId);
          return auditData;
        }

        console.warn('Audit not found in IndexedDB:', localId);
        return null;
      } catch (error) {
        console.error('loadAuditByLocalId error', error);
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },

    async saveAuditToDB({ state }) {
      try {
        if (!state.currentAudit) return;

        const auditData = {
          localId: state.currentAudit.localId,
          templateId: state.currentAudit.templateId,
          locationId: state.currentAudit.locationId || '',
          audit: JSON.parse(JSON.stringify(state.currentAudit)),
          answers: JSON.parse(JSON.stringify(state.answers)),
          startedAt: state.startedAt,
          startLocation: state.startLocation
            ? JSON.parse(JSON.stringify(state.startLocation))
            : null,
          endLocation: state.endLocation
            ? JSON.parse(JSON.stringify(state.endLocation))
            : null,
          updatedAt: new Date().toISOString(),
        };

        await auditsDataTable.put(auditData);
      } catch (error) {
        console.error('saveAuditToDB error', error);
      }
    },

    async findExistingAudit(_, { templateId, locationId }) {
      try {
        const normalizedLocationId = locationId || '';
        const existing = await auditsDataTable
          .where('[templateId+locationId]')
          .equals([templateId, normalizedLocationId])
          .first();
        return existing;
      } catch (error) {
        console.error('findExistingAudit error', error);
        return null;
      }
    },

    async startAudit(
      { commit, dispatch },
      { template, locationId, startLocation },
    ) {
      const localAudit = {
        localId: uid(),
        templateId: template.id,
        locationId: locationId || null,
        name: template.name,
        description: template.description,
        questions: template.questions,
        location: template.locations?.find(l => l.id === locationId) || null,
      };

      commit('setCurrentAudit', localAudit);
      commit('clearAnswers');
      if (startLocation) {
        commit('setStartLocation', startLocation);
      }

      await dispatch('saveAuditToDB');

      return localAudit;
    },

    async setAnswer({ commit, dispatch }, { questionId, value }) {
      commit('setAnswer', { questionId, value });
      await dispatch('saveAuditToDB');
    },

    async submitAudit({ state, commit }) {
      try {
        if (!state.currentAudit) {
          throw new Error('No active audit');
        }

        commit('setLoading', true);

        const answers = Object.entries(state.answers).map(
          ([questionId, value]) => ({
            questionId,
            value,
            comment: null,
          }),
        );

        const result = await api.post('/api/pwa/audits/submit', {
          templateId: state.currentAudit.templateId,
          locationId: state.currentAudit.locationId,
          answers,
          startedAt: state.startedAt,
          completedAt: new Date().toISOString(),
          localId: state.currentAudit.localId,
        });

        await auditsDataTable.delete(state.currentAudit.localId);

        commit('clearCurrentAudit');
        return result.data;
      } catch (error) {
        console.error('submitAudit error', error);
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },

    async clearAuditData({ commit }) {
      await auditsDataTable.clear();
      commit('clearCurrentAudit');
    },

    async clearAudit({ commit }, { localId }) {
      try {
        await photosTable.where('auditLocalId').equals(localId).delete();
        await auditsDataTable.delete(localId);
        commit('clearCurrentAudit');
      } catch (error) {
        console.error('clearAudit error', error);
        throw error;
      }
    },
  },
};
