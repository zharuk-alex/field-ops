export default {
  path: '/templates',
  name: 'templates',
  component: () => import('@/layouts/ListAndCrudLayout.vue'),
  meta: {
    title: 'Templates',
    i18n: 'template',
    userRole: 'admin',
    menu: true,
  },
  children: [
    {
      path: '',
      name: 'templates-list',
      components: {
        list: () => import('src/pages/admin/Templates/TemplatesList.vue'),
      },
    },
    {
      path: 'new',
      name: 'template-create',
      components: {
        new: () => import('src/pages/admin/Templates/TemplateEditPage.vue'),
      },
    },
    {
      path: ':id',
      name: 'template-edit',
      components: {
        edit: () => import('src/pages/admin/Templates/TemplateEditPage.vue'),
      },
    },
  ],
};
