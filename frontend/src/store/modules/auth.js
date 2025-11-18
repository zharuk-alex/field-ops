import { LocalStorage } from 'quasar'
import { api } from 'boot/axios'

const TOKEN_KEY =
  import.meta.env.VITE_STORAGE_TOKEN_KEY ||
  `field-ops:${import.meta.env.VITE_BUILD_TARGET || 'pwa'}:token`
const USER_KEY = `field-ops:${import.meta.env.VITE_BUILD_TARGET || 'pwa'}:user`

export default {
  namespaced: true,

  state: () => ({
    token: null,
    user: null,
  }),

  getters: {
    isAuthenticated: (s) => !!s.token,
    bearer: (s) => (s.token ? `Bearer ${s.token}` : null),
    user: (s) => s.user,
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
      const token = LocalStorage.getItem(TOKEN_KEY)
      const user = LocalStorage.getItem(USER_KEY)
      if (token) commit('setToken', token)
      if (user) commit('setUser', user)
    },

    async login({ commit }, { email, password }) {
      const { data } = await api.post('/api/auth/login', { email, password })
      commit('setToken', data.token)
      commit('setUser', data.user ?? null)
      LocalStorage.setItem(TOKEN_KEY, data.token)
      if (data.user) {
        LocalStorage.setItem(USER_KEY, data.user)
      }
      return data
    },

    async fetchCurrentUser({ commit }) {
      try {
        const { data } = await api.get('/api/auth/current')
        commit('setUser', data)
        LocalStorage.setItem(USER_KEY, data)
        return data
      } catch (err) {
        const cachedUser = LocalStorage.getItem(USER_KEY)
        if (cachedUser) {
          commit('setUser', cachedUser)
          return cachedUser
        }
        throw err
      }
    },

    logout({ commit }) {
      LocalStorage.removeItem(TOKEN_KEY)
      LocalStorage.removeItem(USER_KEY)
      commit('reset')
    },
  },
}
