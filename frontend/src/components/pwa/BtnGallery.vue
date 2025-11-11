<template>
  <q-btn
    flat
    square
    class="fit col"
    :color="$q.dark.isActive ? 'grey-3' : 'grey-8'"
    @click="toggleGal"
  >
    <q-icon name="mdi-folder-multiple-image">
      <q-badge
        v-if="!isNaN(Number(photosCount))"
        color="red"
        floating
        style="top: -4px; right: -12px; font-style: initial; font-size: x-small"
      >
        {{ photosCount }}
      </q-badge>
    </q-icon>
  </q-btn>
</template>

<script setup>
import { useGlobMixin } from '@/composable/useGlobalMixin';

const { $route, $router } = useGlobMixin();

defineProps({
  photosCount: {
    type: Number,
    default: null,
  },
});

const toggleGal = () => {
  const main = $route.name.split(':')?.[0] || '';
  if (!main.length) {
    return;
  }
  if ($route.name == `${main}:photos`) {
    $router.push({ name: `${main}` });
  } else {
    $router.push({
      name: `${main}:photos`,
      params: { num: 1 },
    });
  }
};
</script>

<style lang="scss" scoped></style>
