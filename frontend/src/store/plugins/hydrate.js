const TOKEN_KEY =
  import.meta.env.VITE_STORAGE_TOKEN_KEY ||
  `field-ops:${import.meta.env.VITE_BUILD_TARGET || 'pwa'}:token`

export default function hydrate(store) {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) store.commit('auth/setToken', token)
  } catch (error) {
    console.error(error)
  }
}
