import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

export function useGlobMixin() {
  const $store = useStore()
  const $route = useRoute()
  const $router = useRouter()
  const $q = useQuasar()
  const { t } = useI18n()

  const isDev = process.env.DEV
  return {
    $q,
    $store,
    $route,
    $router,
    t,
    isDev,
  }
}
