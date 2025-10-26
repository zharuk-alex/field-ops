import { createStore } from 'vuex'
import uiServices from './modules/ui-services.js'
import auth from './modules/auth.js'
import text from './modules/text.js'
import hydrate from './plugins/hydrate.js'

const store = createStore({
  strict: process.env.DEBUGGING,
  modules: {
    auth,
    text,
    uiServices,
  },
  plugins: [hydrate],
  state: {},
  mutations: {},
  actions: {},
  getters: {
    init: () => 'init',
  },
})

export default store
