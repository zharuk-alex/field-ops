<template>
  <q-page padding>
    <div class="settings-container">
      <q-card class="settings-card">
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ t('appearance') }}</div>

          <q-list>
            <q-item clickable @click="toggleMode" class="q-mb-md">
              <q-item-section avatar>
                <q-icon name="mdi-theme-light-dark" color="primary" size="md" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ t('theme') }}</q-item-label>
                <q-item-label caption>
                  {{ $q.dark.isActive ? t('darkTheme') : t('lightTheme') }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle
                  :model-value="$q.dark.isActive"
                  @update:model-value="toggleMode"
                  color="primary"
                  :icon="
                    $q.dark.isActive
                      ? 'mdi-moon-waning-crescent'
                      : 'mdi-white-balance-sunny'
                  "
                />
              </q-item-section>
            </q-item>

            <q-separator class="q-my-md" />

            <q-item>
              <q-item-section avatar>
                <q-icon name="mdi-translate" color="primary" size="md" />
              </q-item-section>
              <q-item-section>
                <q-select
                  v-model="langModel"
                  :options="langOptions"
                  :label="t('language')"
                  emit-value
                  map-options
                  filled
                  :disable="disabledLangSelect"
                >
                  <template v-slot:prepend>
                    <q-icon name="mdi-web" />
                  </template>
                </q-select>
                <q-item-label
                  v-if="!isOnline"
                  caption
                  class="text-negative q-mt-xs"
                >
                  {{ t('offline') }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import langUk from 'quasar/lang/uk';
import langEn from 'quasar/lang/en-GB';
import { capitalizeStr } from '@/helpers';
import { Dark, LocalStorage } from 'quasar';
import { computed, watch, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGlobMixin } from '@/composable/useGlobalMixin';

const { locale } = useI18n({ useScope: 'global' });
const { $store, $q, t } = useGlobMixin();

const languages = [
  { isoName: 'uk', nativeName: 'Українська' },
  { isoName: 'en-GB', nativeName: 'English (UK)' },
];

const langModel = computed({
  get() {
    return $store.getters['text/userLang'] === 'en'
      ? 'en-GB'
      : $store.getters['text/userLang'];
  },
  set(isoName) {
    $store.commit('text/userLang', isoName);
  },
});

watch(langModel, async isoName => {
  locale.value = isoName;
  switch (isoName) {
    case 'en-GB':
      $q.lang.set(langEn);
      break;
    default:
      $q.lang.set(langUk);
      break;
  }
});

const isOnline = computed(() => $store.getters['uiServices/isOnline']);
const disabledLangSelect = computed(() => !isOnline.value);

const langOptions = (languages ?? [])
  .filter(lang => ['uk', 'en-GB'].includes(lang.isoName))
  .map(lang => ({
    label: capitalizeStr(lang.nativeName),
    value: lang.isoName,
  }));

const toggleMode = () => {
  Dark.toggle();
  LocalStorage.set('dark_mode', Dark.isActive);
};

onBeforeMount(() => {
  const dark_mode = LocalStorage.getItem('dark_mode') || false;
  Dark.set(dark_mode);
});
</script>

<style lang="scss" scoped>
.settings-container {
  max-width: 600px;
  margin: 0 auto;
}

.settings-card {
  border-radius: 12px;
}
</style>
