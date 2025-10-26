import { LocalStorage } from 'quasar'

export default {
  namespaced: true,

  state: () => ({
    userLang: LocalStorage.getItem('userLang') || null,
    supportedLangs: ['uk', 'en'],
    textLoaded: false,
  }),

  getters: {
    userLang: (state) => state.userLang,
    supportedLangs: (state) => state.supportedLangs,
    textLoaded: (state) => state.textLoaded,
    langIncludes: (state) => (lang) => state.supportedLangs.includes(lang),
  },

  mutations: {
    userLang(state, lang) {
      state.userLang = lang
      LocalStorage.set('userLang', lang)
    },
    textLoaded(state, payload) {
      state.textLoaded = payload
    },
  },

  actions: {},
}
