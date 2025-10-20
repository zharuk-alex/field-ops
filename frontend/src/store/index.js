import { createStore } from 'vuex'

const store = createStore({
  // enable strict mode (adds overhead!)
  // for dev mode and --debug builds only
  strict: process.env.DEBUGGING,
  modules: {},
  state: {},
  mutations: {},
  actions: {},
  getters: {
    init: () => 'init',
  },
})

export default store
