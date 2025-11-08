<template>
  <q-drawer
    :model-value="drawer"
    @update:model-value="$emit('update:drawer', $event)"
    show-if-above
    bordered
    :breakpoint="690"
  >
    <q-toolbar :class="[$q.dark.isActive ? 'bg-grey-10' : 'bg-grey-3']">
      <p class="text-body2">
        <slot name="title"></slot>
      </p>

      <q-space />
      <q-btn
        round
        flat
        icon="mdi-close"
        @click="$emit('update:drawer', false)"
      />
    </q-toolbar>
    <div
      class="flex column"
      style="height: calc(100% - 50px); padding-bottom: 24px"
    >
      <q-scroll-area
        style="height: 50%"
        :content-style="{ display: 'flex', flexDirection: 'column' }"
      >
        <q-list class="full-width q-mt-md">
          <AdminMenu />
        </q-list>
      </q-scroll-area>
      <q-scroll-area
        style="height: 50%"
        :content-style="{ display: 'flex', flexDirection: 'column' }"
      >
        <q-list class="q-mt-auto">
          <q-item
            clickable
            class="q-pb-none"
            :to="{ name: 'user_profile' }"
            exact
          >
            <q-item-section side>
              <q-icon
                name="mdi-account"
                :color="$q.dark.isActive ? 'secondary' : 'success'"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>
                {{ $t('profile') }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item
            clickable
            class="q-pb-none"
            :to="{ name: 'user-settings' }"
            exact
          >
            <q-item-section side>
              <q-icon
                name="mdi-cog"
                :color="$q.dark.isActive ? 'secondary' : 'success'"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>
                {{ $t('settings') }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item :clickable="false" v-ripple="false">
            <q-item-section>
              <q-select
                v-model="langModel"
                id="select_user_lang"
                name="`select_user_lang`"
                :options="langOptions"
                :label="$t('language')"
                behavior="menu"
                filled
                square
                emit-value
                map-options
                :disable="disabledLangSelect"
              />
            </q-item-section>
          </q-item>
          <q-item clickable class="q-pb-none" @click="toggleMode">
            <q-item-section side>
              <q-icon
                name="mdi-theme-light-dark"
                :color="$q.dark.isActive ? 'secondary' : 'success'"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>
                {{ $t(`${$q.dark.isActive ? 'darkTheme' : 'lightTheme'}`) }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item
            v-if="isAuthenticated"
            v-ripple
            clickable
            @click="logout"
            class="text-uppercase"
          >
            <q-item-section side>
              <q-icon name="mdi-logout-variant" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('logout') }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </div>
  </q-drawer>
</template>

<script setup>
import langUk from 'quasar/lang/uk';
import langEn from 'quasar/lang/en-GB';

import { capitalizeStr } from '@/helpers';
import { Dark, LocalStorage } from 'quasar';
import {
  computed,
  watch,
  onBeforeMount,
  onMounted,
  onBeforeUnmount,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useGlobMixin } from '@/composable/useGlobalMixin';
import AdminMenu from '@/components/admin/AdminMenu.vue';

defineProps(['drawer']);
const { locale } = useI18n({ useScope: 'global' });
const $emit = defineEmits(['update:drawer']);
const { $store, $router, $q } = useGlobMixin();

const languages = [
  { isoName: 'uk', nativeName: 'Українська' },
  { isoName: 'en-GB', nativeName: 'English (UK)' },
];

const isAuthenticated = computed(
  () => $store.getters?.['auth/isAuthenticated'],
);

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

const logout = async () => {
  await $store.dispatch('auth/logout');
  await $router.push('/login');
};

onBeforeMount(() => {
  const dark_mode = LocalStorage.getItem('dark_mode') || false;
  Dark.set(dark_mode);
});

onMounted(() => {});

onBeforeUnmount(() => {});
</script>
