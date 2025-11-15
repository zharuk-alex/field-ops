export default {
  path: '/locations',
  name: 'locations',
  component: () => import('@/layouts/ListAndCrudLayout.vue'),
  meta: {
    title: 'Locations',
    i18n: 'location',
    userRole: 'admin',
    menu: true,
  },
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
    },
    {
      path: ':id',
      name: 'location-edit',
      components: {
        edit: () => import('src/pages/admin/Locations/LocationEditPage.vue'),
      },
    },
  ],
};
