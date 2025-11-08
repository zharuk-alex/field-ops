<template>
  <q-page padding>
    <div v-if="loading || !currentAudit" class="text-center q-pa-xl">
      <q-spinner size="50px" color="primary" />
      <div class="q-mt-md text-grey-7">{{ t('loadingAudit') }}</div>
    </div>

    <div v-else>
      <div class="q-mb-md">
        <div class="text-h5">{{ currentAudit.name }}</div>
        <div v-if="currentAudit.description" class="text-caption text-grey-7">
          {{ currentAudit.description }}
        </div>
        <div v-if="currentAudit.location" class="q-mt-sm">
          <q-chip dense icon="place" color="secondary">
            {{ currentAudit.location.name }}
          </q-chip>
        </div>
      </div>

      <q-linear-progress
        :value="progress / 100"
        color="positive"
        class="q-mb-md"
        size="8px"
      />
      <div class="text-center text-caption text-grey-7 q-mb-lg">
        {{ t('progress') }}: {{ progress }}% ({{ answeredCount }}/{{
          totalQuestions
        }})
      </div>

      <div class="q-gutter-md">
        <q-card
          v-for="(question, index) in questions"
          :key="question.id"
          class="q-mb-md"
        >
          <q-card-section>
            <div class="row items-start q-mb-md">
              <div class="col">
                <div class="text-subtitle1 text-weight-medium">
                  {{ index + 1 }}. {{ question.questionText }}
                  <q-chip
                    v-if="question.required"
                    dense
                    size="sm"
                    color="red"
                    text-color="white"
                    class="q-ml-xs"
                  >
                    *
                  </q-chip>
                </div>
                <div class="text-caption text-grey-6">
                  {{ t(`questionType.${question.type}`) }}
                </div>
              </div>
            </div>

            <div v-if="question.type === 'boolean'">
              <q-btn-toggle
                :model-value="answers[question.id]"
                :options="[
                  { label: t('yes'), value: true },
                  { label: t('no'), value: false },
                ]"
                toggle-color="primary"
                @update:model-value="saveAnswer(question.id, $event)"
              />
            </div>

            <div v-else-if="question.type === 'choice' && question.choices">
              <q-option-group
                :model-value="answers[question.id]"
                :options="formatChoices(question.choices)"
                type="radio"
                @update:model-value="saveAnswer(question.id, $event)"
              />
            </div>

            <div
              v-else-if="question.type === 'multipleChoice' && question.choices"
            >
              <q-select
                :model-value="answers[question.id]"
                :options="formatChoices(question.choices)"
                multiple
                filled
                :label="t('selectOptions')"
                emit-value
                map-options
                use-chips
                @update:model-value="saveAnswer(question.id, $event)"
              />
            </div>

            <div v-else-if="question.type === 'number'">
              <q-input
                :model-value="answers[question.id]"
                type="number"
                filled
                :label="t('enterNumber')"
                @update:model-value="saveAnswer(question.id, $event)"
              />
            </div>

            <div v-else-if="question.type === 'rating'">
              <q-rating
                :model-value="answers[question.id]"
                size="2em"
                color="orange"
                icon="star_border"
                icon-selected="star"
                :max="5"
                @update:model-value="saveAnswer(question.id, $event)"
              />
            </div>

            <div v-else-if="question.type === 'text'">
              <q-input
                :model-value="answers[question.id]"
                filled
                type="textarea"
                :label="t('enterText')"
                rows="3"
                @update:model-value="saveAnswer(question.id, $event)"
              />
            </div>

            <div v-else-if="question.type === 'photo'">
              <q-file
                :model-value="answers[question.id]"
                filled
                :label="t('selectPhoto')"
                accept="image/*"
                @update:model-value="saveAnswer(question.id, $event)"
              >
                <template #prepend>
                  <q-icon name="photo_camera" />
                </template>
              </q-file>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <Teleport v-if="isMounted" to="#app-footer">
      <q-btn
        v-if="currentAudit && !loading"
        :label="t('submitAudit')"
        color="primary"
        size="lg"
        class="full-width"
        :disable="!canSubmit"
        :loading="submitting"
        @click="submit"
        unelevated
      />
    </Teleport>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useGlobMixin } from '@/composable/useGlobalMixin';

const route = useRoute();
const { $store, t, $router } = useGlobMixin();

const currentAudit = computed(() => $store.getters['pwaAudits/currentAudit']);
const answers = computed(() => $store.getters['pwaAudits/answers']);
const progress = computed(() => $store.getters['pwaAudits/progress']);
const hydrated = computed(() => $store.getters['pwaAudits/hydrated']);

const submitting = ref(false);
const loading = ref(true);
const isMounted = ref(false);

const questions = computed(() => currentAudit.value?.questions || []);
const totalQuestions = computed(() => questions.value.length);
const answeredCount = computed(() => Object.keys(answers.value).length);

const canSubmit = computed(() => {
  const requiredQuestions = questions.value.filter(q => q.required);
  return requiredQuestions.every(q => answers.value[q.id] !== undefined);
});

function formatChoices(choices) {
  if (Array.isArray(choices)) {
    return choices.map(c => ({
      label: typeof c === 'string' ? c : c.label || c.value,
      value: typeof c === 'string' ? c : c.value,
    }));
  }
  return [];
}

function saveAnswer(questionId, value) {
  $store.dispatch('pwaAudits/setAnswer', { questionId, value });
}

async function submit() {
  try {
    submitting.value = true;

    await $store.dispatch('pwaAudits/submitAudit');

    $store.dispatch('uiServices/showNotification', {
      message: t('auditSubmittedSuccessfully'),
      color: 'positive',
    });

    $router.push({ name: 'index' });
  } catch (err) {
    console.error('Submit audit error', err);
    $store.dispatch('uiServices/showNotification', {
      message: err?.response?.data?.message || t('failedToSubmitAudit'),
      color: 'negative',
    });
  } finally {
    submitting.value = false;
  }
}

async function loadAudit() {
  const auditLocalId = route.params.id;

  if (!auditLocalId) {
    console.error('No audit ID in route');
    $router.push({ name: 'index' });
    return;
  }

  if (!hydrated.value) {
    const checkHydration = setInterval(() => {
      if (hydrated.value) {
        clearInterval(checkHydration);
        checkAuditLoaded(auditLocalId);
      }
    }, 50);

    setTimeout(() => {
      clearInterval(checkHydration);
      if (!hydrated.value) {
        console.warn('Hydration timeout');
        checkAuditLoaded(auditLocalId);
      }
    }, 5000);
  } else {
    checkAuditLoaded(auditLocalId);
  }
}

async function checkAuditLoaded(auditLocalId) {
  if (currentAudit.value?.localId === auditLocalId) {
    loading.value = false;
    return;
  }

  try {
    const loaded = await $store.dispatch(
      'pwaAudits/loadAuditByLocalId',
      auditLocalId,
    );

    if (!loaded) {
      console.error('Audit not found:', auditLocalId);
      $store.dispatch('uiServices/showNotification', {
        message: t('auditNotFound'),
        color: 'negative',
      });
      $router.push({ name: 'index' });
    }
  } catch (err) {
    console.error('Load audit error', err);
    $store.dispatch('uiServices/showNotification', {
      message: t('failedToLoadAudit'),
      color: 'negative',
    });
    $router.push({ name: 'index' });
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  isMounted.value = true;
  loadAudit();
});
</script>

<style lang="scss" scoped></style>
