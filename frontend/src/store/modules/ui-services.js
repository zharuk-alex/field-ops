import { Notify } from 'quasar';

export default {
  namespaced: true,

  state: () => ({
    isOnline: true,
    notifications: [],
    footerAction: null,
  }),

  getters: {
    isOnline: state => state.isOnline,
    notifications: state => state.notifications,
    footerAction: state => state.footerAction,
  },

  mutations: {
    SET_IS_ONLINE(state, payload) {
      state.isOnline = payload;
    },
    SET_FOOTER_ACTION(state, payload) {
      state.footerAction = payload;
    },
    ADD_NOTIFICATION(state, payload) {
      state.notifications.push(payload);
    },
    REMOVE_NOTIFICATION(state, id) {
      state.notifications = state.notifications.filter(n => n.id !== id);
    },
    CLEAR_NOTIFICATIONS(state) {
      state.notifications = [];
    },
  },

  actions: {
    showNotification({ commit }, payload = {}) {
      return new Promise(resolve => {
        const id = String(Date.now()) + Math.floor(Math.random() * 1000);
        const p = {
          id,
          message: payload.message || '',
          color: payload.color || 'primary',
          timeout: typeof payload.timeout === 'number' ? payload.timeout : 5000,
          position: payload.position || 'top-right',
          icon: payload.icon || null,
          meta: payload.meta || null,
        };

        commit('ADD_NOTIFICATION', p);

        try {
          const notifyOpts = {
            message: p.message,
            timeout: p.timeout,
            position: p.position,
            color: p.color,
          };
          if (p.icon) notifyOpts.icon = p.icon;
          Notify.create(notifyOpts);
        } catch (e) {
          console.error('Notify failed', e);
        }

        if (p.timeout && p.timeout > 0) {
          setTimeout(() => {
            commit('REMOVE_NOTIFICATION', id);
          }, p.timeout + 200);
        }

        resolve(p);
      });
    },

    dismissNotification({ commit }, id) {
      commit('REMOVE_NOTIFICATION', id);
      return Promise.resolve(id);
    },

    clearAll({ commit }) {
      commit('CLEAR_NOTIFICATIONS');
      return Promise.resolve();
    },

    setFooterAction({ commit }, payload) {
      commit('SET_FOOTER_ACTION', payload);
    },

    clearFooterAction({ commit }) {
      commit('SET_FOOTER_ACTION', null);
    },
  },
};
