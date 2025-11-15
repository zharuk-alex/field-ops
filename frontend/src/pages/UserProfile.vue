<template>
  <q-page padding>
    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner size="50px" color="primary" />
      <div class="q-mt-md text-grey-7">{{ t('loading') }}...</div>
    </div>

    <div v-else-if="user" class="profile-container">
      <div class="row items-center q-mb-lg">
        <q-btn
          flat
          round
          dense
          icon="arrow_back"
          @click="$router.back()"
          class="q-mr-md"
        />
        <div class="text-h5">{{ t('profile') }}</div>
      </div>

      <q-card class="profile-card">
        <q-card-section class="text-center q-pb-none">
          <q-avatar size="100px" color="primary" text-color="white">
            <span class="text-h4">{{ userInitials }}</span>
          </q-avatar>
        </q-card-section>

        <q-card-section>
          <div class="text-h6 text-center q-mb-md">
            {{ userFullName || user.email }}
          </div>

          <q-list>
            <q-item>
              <q-item-section avatar>
                <q-icon name="email" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>{{ t('email') }}</q-item-label>
                <q-item-label>{{ user.email }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-if="user.firstName">
              <q-item-section avatar>
                <q-icon name="person" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>{{ t('firstName') }}</q-item-label>
                <q-item-label>{{ user.firstName }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-if="user.lastName">
              <q-item-section avatar>
                <q-icon name="person_outline" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>{{ t('lastName') }}</q-item-label>
                <q-item-label>{{ user.lastName }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="badge" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>{{ t('role') }}</q-item-label>
                <q-item-label>
                  <q-badge :color="getRoleColor(user.role)">
                    {{ t(`userRole.${user.role}`) }}
                  </q-badge>
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="check_circle" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>{{ t('status') }}</q-item-label>
                <q-item-label>
                  <q-badge :color="getStatusColor(user.status)">
                    {{ t(`userStatus.${user.status}`) }}
                  </q-badge>
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-if="user.createdAt">
              <q-item-section avatar>
                <q-icon name="calendar_today" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>{{ t('memberSince') }}</q-item-label>
                <q-item-label>{{ formatDateTime(user.createdAt) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="center" class="q-pa-md">
          <q-btn
            flat
            color="negative"
            icon="logout"
            :label="t('logout')"
            @click="handleLogout"
          />
        </q-card-actions>
      </q-card>
    </div>

    <div v-else class="text-center q-pa-xl">
      <q-icon name="error" size="64px" color="grey" />
      <div class="text-h6 q-mt-md text-grey-7">{{ t('failedToLoadProfile') }}</div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useGlobMixin } from '@/composable/useGlobalMixin';
import { formatDateTime } from '@/helpers/datetime';
import { api } from '@/boot/axios';

const { $store, t, $router } = useGlobMixin();

const loading = ref(false);
const user = ref(null);

const userFullName = computed(() => {
  if (!user.value) return '';
  const parts = [];
  if (user.value.firstName) parts.push(user.value.firstName);
  if (user.value.lastName) parts.push(user.value.lastName);
  return parts.join(' ');
});

const userInitials = computed(() => {
  if (!user.value) return '?';

  const first = user.value.firstName?.[0] || '';
  const last = user.value.lastName?.[0] || '';

  if (first || last) {
    return (first + last).toUpperCase();
  }

  return user.value.email?.[0]?.toUpperCase() || '?';
});

function getRoleColor(role) {
  const colors = {
    admin: 'red',
    manager: 'blue',
    auditor: 'green',
  };
  return colors[role] || 'grey';
}

function getStatusColor(status) {
  const colors = {
    active: 'positive',
    inactive: 'negative',
  };
  return colors[status] || 'grey';
}

async function loadProfile() {
  loading.value = true;
  try {
    const { data } = await api.get('/api/auth/current');
    user.value = data;
  } catch (error) {
    console.error('Failed to load profile:', error);
    $store.dispatch('uiServices/showNotification', {
      message: t('failedToLoadProfile'),
      color: 'negative',
    });
  } finally {
    loading.value = false;
  }
}

async function handleLogout() {
  try {
    await $store.dispatch('auth/logout');
    $router.push({ name: 'login' });
  } catch (error) {
    console.error('Logout error:', error);
  }
}

onMounted(() => {
  loadProfile();
});
</script>

<style lang="scss" scoped>
.profile-container {
  max-width: 600px;
  margin: 0 auto;
}

.profile-card {
  border-radius: 12px;
}
</style>
