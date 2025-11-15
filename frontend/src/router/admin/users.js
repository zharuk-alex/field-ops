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
        list: () => import('src/pages/admin/Users/UsersList.vue'),
      },
    },
    {
      path: 'new',
      name: 'user-create',
      components: {
        new: () => import('src/pages/admin/Users/UserEditPage.vue'),
      },
    },
    {
      path: ':id',
      name: 'user-edit',
      components: {
        edit: () => import('src/pages/admin/Users/UserEditPage.vue'),
      },
    },
  ],
};
