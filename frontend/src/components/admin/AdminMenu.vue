<template>
  <q-item
    v-for="item in menuItems"
    class="q-pb-none"
    :key="item.name"
    :to="item.path"
  >
    <q-item-section v-if="item?.icon" side>
      <q-icon
        :name="item?.icon"
        :color="$q.dark.isActive ? 'secondary' : 'success'"
      />
    </q-item-section>
    <q-item-section>
      <q-item-label class="text-uppercase">
        {{ $t(item.i18n) }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { useGlobMixin } from 'src/composable/useGlobalMixin';
import { computed } from 'vue';

const { $router } = useGlobMixin();
const menuItems = computed(() => {
  const menus = {};
  for (const r of $router.getRoutes()) {
    if (r.meta?.menu) {
      menus[r.name] = { ...r.meta, path: r.path, name: r.name };
    }
  }
  return menus;
});
</script>

<style lang="scss" scoped></style>
