export default {
  path: '/companies',
  name: 'companies',
  component: () => import('@/layouts/ListAndCrudLayout.vue'),
  meta: {
    title: 'Companies',
    i18n: 'companies',
    userRole: 'admin',
    menu: true,
  },
  redirect: { name: 'companies-list' },
  children: [
    {
      path: '',
      name: 'companies-list',
      components: {
        list: () => import('src/pages/admin/Companies/CompaniesList.vue'),
      },
    },
    {
      path: 'new',
      name: 'company-create',
      components: {
        new: () => import('src/pages/admin/Companies/CompanyEditPage.vue'),
      },
      meta: {
        i18n: 'create',
      },
    },
    {
      path: ':id',
      name: 'company-edit',
      components: {
        edit: () => import('src/pages/admin/Companies/CompanyEditPage.vue'),
      },
      meta: {
        i18n: 'edit',
      },
    },
  ],
};
