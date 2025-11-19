export default {
  path: '/locations',
  name: 'locations',
  component: () => import('@/layouts/ListAndCrudLayout.vue'),
  meta: {
    title: 'Locations',
    i18n: 'locations',
    userRole: 'admin',
    menu: true,
  },
  redirect: { name: 'locations-list' },
  children: [
    {
      path: '',
      name: 'locations-list',
      components: {
        list: () => import('src/pages/admin/Locations/LocationsList.vue'),
      },
    },
    {
      path: 'new',
      name: 'location-create',
      components: {
        new: () => import('src/pages/admin/Locations/LocationEditPage.vue'),
      },
      meta: {
        i18n: 'create',
      },
    },
    {
      path: ':id',
      name: 'location-edit',
      components: {
        edit: () => import('src/pages/admin/Locations/LocationEditPage.vue'),
      },
      meta: {
        i18n: 'edit',
      },
    },
  ],
};
