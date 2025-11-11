<template>
  <q-page padding>
    <q-pull-to-refresh @refresh="onRefresh">
      <div class="q-mb-md">
        <div class="text-h5 q-mb-sm">{{ t('availableTemplates') }}</div>
        <div class="text-caption text-grey-7">
          {{ t('selectTemplateToStartAudit') }}
        </div>
      </div>

      <q-linear-progress v-if="loading" indeterminate color="primary" />

      <div
        v-if="!loading && templates.length === 0"
        class="text-center q-pa-xl"
      >
        <q-icon name="description" size="64px" color="grey-5" />
        <div class="text-grey-7 q-mt-md">
          {{ t('noTemplatesAvailable') }}
        </div>
      </div>

      <div v-else-if="groupBy === 'template'" class="q-gutter-md">
        <q-card
          v-for="template in templates"
          :key="template.id"
          class="cursor-pointer"
          @click="selectTemplate(template)"
        >
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h6">{{ template.name }}</div>
                <div
                  v-if="template.description"
                  class="text-caption text-grey-7 q-mt-xs"
                >
                  {{ template.description }}
                </div>
              </div>
              <div class="col-auto">
                <q-icon name="chevron_right" size="24px" color="grey-5" />
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pt-sm">
            <div class="row q-col-gutter-sm">
              <div class="col-auto">
                <q-chip dense icon="help_outline" color="grey-3">
                  {{ template.questionsCount }}
                  {{ t('question', { n: template.questionsCount }) }}
                </q-chip>
              </div>
              <div v-if="template.locations?.length" class="col-auto">
                <q-chip dense icon="place" color="grey-3">
                  {{ template.locations.length }}
                  {{ t('location', { n: template.locations?.length }) }}
                </q-chip>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div v-else class="q-gutter-md">
        <div
          v-for="group in groupedByLocation"
          :key="group.locationId || 'no-location'"
        >
          <div class="text-h6 q-mb-sm q-mt-md">
            <q-icon
              :name="group.locationId ? 'place' : 'layers'"
              class="q-mr-sm"
            />
            {{ group.locationName }}
          </div>

          <q-card
            v-for="item in group.items"
            :key="`${item.template.id}-${item.locationId || 'none'}`"
            class="cursor-pointer q-mb-sm"
            @click="selectTemplateWithLocation(item.template, item.locationId)"
          >
            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <div class="text-subtitle1">{{ item.template.name }}</div>
                  <div
                    v-if="item.template.description"
                    class="text-caption text-grey-7 q-mt-xs"
                  >
                    {{ item.template.description }}
                  </div>
                </div>
                <div class="col-auto">
                  <q-icon name="chevron_right" size="24px" color="grey-5" />
                </div>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section class="q-pt-sm">
              <q-chip dense icon="help_outline" color="grey-3">
                {{ item.template.questionsCount }}
                {{ t('question', { n: item.template.questionsCount }) }}
              </q-chip>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <q-dialog v-model="showLocationDialog" persistent>
        <q-card style="min-width: 300px">
          <q-card-section>
            <div class="text-h6">{{ t('selectLocation') }}</div>
          </q-card-section>

          <q-card-section>
            <q-select
              v-model="selectedLocation"
              :options="locationOptions"
              :label="t('location')"
              emit-value
              map-options
              filled
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat :label="t('cancel')" v-close-popup />
            <q-btn
              :label="t('start')"
              color="primary"
              :disable="!selectedLocation"
              :loading="starting"
              @click="startAudit"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <LocationConfirmDialog
        v-model="showLocationConfirmDialog"
        :title="t('start')"
        :location-name="locationForConfirm?.name"
        :target-location="locationForConfirm"
        :confirm-label="t('start')"
        @confirm="handleLocationConfirm"
        @cancel="handleLocationCancel"
      />
    </q-pull-to-refresh>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn
        fab
        icon="sync"
        color="primary"
        :loading="syncing"
        @click="syncTemplates"
      />
    </q-page-sticky>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useGlobMixin } from '@/composable/useGlobalMixin';
import LocationConfirmDialog from '@/components/pwa/LocationConfirmDialog.vue';

const { $store, t, $router } = useGlobMixin();

const loading = computed(() => $store.getters['pwaTemplates/loading']);
const templates = computed(() => $store.getters['pwaTemplates/templates']);
const groupBy = computed(() => $store.getters['pwaFilters/groupBy']);

const showLocationDialog = ref(false);
const selectedTemplate = ref(null);
const selectedLocation = ref(null);
const starting = ref(false);

const showLocationConfirmDialog = ref(false);
const locationForConfirm = ref(null);
const templateForStart = ref(null);
const locationIdForStart = ref(null);
const gpsDataForStart = ref(null);
const syncing = ref(false);

const locationOptions = computed(() => {
  if (!selectedTemplate.value?.locations?.length) return [];
  return selectedTemplate.value.locations.map(l => ({
    label: l.name,
    value: l.id,
    caption: l.address,
  }));
});

const groupedByLocation = computed(() => {
  const groups = new Map();

  templates.value.forEach(template => {
    if (template.locations?.length > 0) {
      template.locations.forEach(location => {
        const key = location.id;
        if (!groups.has(key)) {
          groups.set(key, {
            locationId: location.id,
            locationName: location.name,
            items: [],
          });
        }
        groups.get(key).items.push({
          template,
          locationId: location.id,
        });
      });
    } else {
      const key = 'no-location';
      if (!groups.has(key)) {
        groups.set(key, {
          locationId: null,
          locationName: t('templatesWithoutLocation'),
          items: [],
        });
      }
      groups.get(key).items.push({
        template,
        locationId: null,
      });
    }
  });

  return Array.from(groups.values());
});

async function loadTemplates() {
  try {
    await $store.dispatch('pwaTemplates/getTemplates');
  } catch (err) {
    console.error('Load templates error', err);
    $store.dispatch('uiServices/showNotification', {
      message: t('failedToLoadTemplates'),
      color: 'negative',
    });
  }
}

async function onRefresh(done) {
  try {
    await $store.dispatch('pwaTemplates/getTemplates', { forceRefresh: true });
    $store.dispatch('uiServices/showNotification', {
      message: t('templatesUpdated'),
      color: 'positive',
    });
  } catch (err) {
    console.error('Refresh templates error', err);
    $store.dispatch('uiServices/showNotification', {
      message: t('failedToLoadTemplates'),
      color: 'negative',
    });
  } finally {
    done();
  }
}

async function syncTemplates() {
  try {
    syncing.value = true;
    await $store.dispatch('pwaTemplates/getTemplates', { forceRefresh: true });
    $store.dispatch('uiServices/showNotification', {
      message: t('templatesUpdated'),
      color: 'positive',
    });
  } catch (err) {
    console.error('Sync templates error', err);
    $store.dispatch('uiServices/showNotification', {
      message: t('failedToLoadTemplates'),
      color: 'negative',
    });
  } finally {
    syncing.value = false;
  }
}

function selectTemplate(template) {
  selectedTemplate.value = template;

  if (template.locations?.length > 0) {
    selectedLocation.value = null;
    showLocationDialog.value = true;
  } else {
    startAuditDirect(template, null);
  }
}

function selectTemplateWithLocation(template, locationId) {
  startAuditDirect(template, locationId);
}

async function startAudit() {
  if (!selectedLocation.value) {
    return;
  }

  await startAuditDirect(selectedTemplate.value, selectedLocation.value);
}

async function startAuditDirect(template, locationId) {
  try {
    starting.value = true;

    const existingAudit = await $store.dispatch('pwaAudits/findExistingAudit', {
      templateId: template.id,
      locationId: locationId,
    });

    if (existingAudit) {
      showLocationDialog.value = false;
      $router.push({
        name: 'audit-perform',
        params: { id: existingAudit.localId },
      });
      return;
    }

    templateForStart.value = template;
    locationIdForStart.value = locationId;

    const location = template.locations?.find(l => l.id === locationId);
    console.log('startAuditDirect:', location?.lat, location?.lng);

    if (location && location.lat && location.lng) {
      locationForConfirm.value = {
        ...location,
        latitude: parseFloat(location.lat),
        longitude: parseFloat(location.lng),
      };
      showLocationDialog.value = false;
      showLocationConfirmDialog.value = true;
      console.log('Showing LocationConfirmDialog');
    } else {
      console.log('Creating audit without GPS confirmation');
      await createAndStartAudit(template, locationId, null);
    }
  } catch (err) {
    console.error('Start audit error', err);
    $store.dispatch('uiServices/showNotification', {
      message: err?.message || t('failedToStartAudit'),
      color: 'negative',
    });
  } finally {
    starting.value = false;
  }
}

async function handleLocationConfirm(gpsData) {
  gpsDataForStart.value = gpsData;
  await createAndStartAudit(
    templateForStart.value,
    locationIdForStart.value,
    gpsData,
  );
}

function handleLocationCancel() {
  starting.value = false;
  templateForStart.value = null;
  locationIdForStart.value = null;
  locationForConfirm.value = null;
  gpsDataForStart.value = null;
}

async function createAndStartAudit(template, locationId, gpsData) {
  try {
    const audit = await $store.dispatch('pwaAudits/startAudit', {
      template,
      locationId,
      startLocation: gpsData,
    });

    showLocationDialog.value = false;

    $router.push({
      name: 'audit-perform',
      params: { id: audit.localId },
    });
  } catch (err) {
    console.error('Create audit error', err);
    $store.dispatch('uiServices/showNotification', {
      message: err?.message || t('failedToStartAudit'),
      color: 'negative',
    });
  } finally {
    starting.value = false;
  }
}

onMounted(loadTemplates);
</script>

<style lang="scss" scoped>
.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
}
</style>
