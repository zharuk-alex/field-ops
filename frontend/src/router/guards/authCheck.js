import store from '@/store'
import { LocalStorage } from 'quasar'

const TOKEN_KEY =
  import.meta.env.VITE_STORAGE_TOKEN_KEY ||
  `field-ops:${import.meta.env.VITE_BUILD_TARGET || 'pwa'}:token`

export default async function authCheck(to) {
  if (to.meta?.requiresAuth === false) {
    if (store.getters?.['auth/isAuthenticated'] && to.name === 'login') {
      return { allow: false, redirect: { name: store.getters?.['auth/homeRoute'] || 'home' } }
    }
    return { allow: true }
  }

  if (to.name === 'login') {
    if (store.getters?.['auth/isAuthenticated']) {
      return { allow: false, redirect: { name: store.getters?.['auth/homeRoute'] || 'home' } }
    }
    return { allow: true }
  }

  const token = store.getters?.['auth/token'] || null
  let isAuthenticated = !!store.getters?.['auth/isAuthenticated']

  if (token && !isAuthenticated) {
    try {
      if (store._actions && store._actions['auth/hydrate']) {
        await store.dispatch('auth/hydrate')
      } else if (store._actions && store._actions['auth/me']) {
        await store.dispatch('auth/me')
      } else if (store._actions && store._actions['auth/fetchUser']) {
        await store.dispatch('auth/fetchUser')
      }
      isAuthenticated = !!store.getters?.['auth/isAuthenticated']
    } catch (err) {
      console.error(err)
      if (store._actions && store._actions['auth/logout']) {
        try {
          await store.dispatch('auth/logout')
        } catch (e) {
          console.error(e)
        }
      } else {
        LocalStorage.removeItem(TOKEN_KEY)
      }
      isAuthenticated = false
    }
  }

  const requiresAuth = to.meta?.requiresAuth !== false

  if (requiresAuth && !isAuthenticated) {
    return { allow: false, redirect: { name: 'login' } }
  }

  if (isAuthenticated && to.name === 'login') {
    return { allow: false, redirect: { name: 'home' } }
  }

  return { allow: true }
}
