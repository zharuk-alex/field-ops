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
        style="height: calc(100% - 200px); min-height: 200px"
        :content-style="{ display: 'flex', flexDirection: 'column' }"
      >
        <q-list class="full-width q-mt-md">
          <AdminMenu />
        </q-list>
      </q-scroll-area>
      <q-scroll-area
        style="height: 200px"
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
              <q-item-label class="text-uppercase">
                {{ $t('profile') }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item
            clickable
            class="q-pb-none"
            :to="{ name: 'user_settings' }"
            exact
          >
            <q-item-section side>
              <q-icon
                name="mdi-cog"
                :color="$q.dark.isActive ? 'secondary' : 'success'"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-uppercase">
                {{ $t('settings') }}
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
import { computed } from 'vue';
import { useGlobMixin } from '@/composable/useGlobalMixin';
import AdminMenu from '@/components/admin/AdminMenu.vue';

defineProps(['drawer']);
const $emit = defineEmits(['update:drawer']);
const { $store, $router } = useGlobMixin();

const isAuthenticated = computed(
  () => $store.getters?.['auth/isAuthenticated'],
);

const logout = async () => {
  await $store.dispatch('auth/logout');
  await $router.push('/login');
};
</script>
