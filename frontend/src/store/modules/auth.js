import { LocalStorage } from 'quasar'
import { api } from 'boot/axios'

const TOKEN_KEY =
  import.meta.env.VITE_STORAGE_TOKEN_KEY ||
  `field-ops:${import.meta.env.VITE_BUILD_TARGET || 'pwa'}:token`

export default {
  namespaced: true,

  state: () => ({
    token: null,
    user: null,
  }),

  getters: {
    isAuthenticated: (s) => !!s.token,
    bearer: (s) => (s.token ? `Bearer ${s.token}` : null),
  },

  mutations: {
    setToken(state, token) {
      state.token = token
    },
    setUser(state, user) {
      state.user = user
    },
    reset(state) {
      state.token = null
      state.user = null
    },
  },

  actions: {
    hydrate({ commit }) {
      const raw = LocalStorage.getItem(TOKEN_KEY)
      if (raw) commit('setToken', raw)
    },

    async login({ commit }, { email, password }) {
      const { data } = await api.post('/api/auth/login', { email, password })
      commit('setToken', data.token)
      commit('setUser', data.user ?? null)
      LocalStorage.setItem(TOKEN_KEY, data.token)
      return data
    },

    logout({ commit }) {
      LocalStorage.removeItem(TOKEN_KEY)
      commit('reset')
    },
  },
}
