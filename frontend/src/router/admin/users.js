export default {
  path: '/users',
  name: 'users',
  component: () => import('@/layouts/ListAndCrudLayout.vue'),
  meta: {
    title: 'Users',
    i18n: 'users',
    userRole: 'admin',
    menu: true,
  },
  children: [
    {
      path: '',
      name: 'users-list',
      components: {
        list: () => import('@/components/admin/UsersList.vue'),
      },
    },
    {
      path: 'new',
      name: 'user-create',
      components: {
        new: () => import('src/pages/admin/UserEditPage.vue'),
      },
    },
    {
      path: ':id',
      name: 'user-edit',
      components: {
        edit: () => import('src/pages/admin/UserEditPage.vue'),
      },
    },
  ],
};
