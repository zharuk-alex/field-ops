export default {
  namespaced: true,

  state: () => ({
    isOnline: true,
  }),

  getters: {
    isOnline: (state) => state.isOnline,
  },

  mutations: {
    isOnline(state, payload) {
      state.isOnline = payload
    },
  },

  actions: {},
}
