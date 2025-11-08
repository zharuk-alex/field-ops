export default {
  path: '/companies',
  name: 'companies',
  component: () => import('@/layouts/ListAndCrudLayout.vue'),
  meta: {
    title: 'Companies',
    i18n: 'company',
    userRole: 'admin',
    menu: true,
  },
  children: [
    {
      path: '',
      name: 'companies-list',
      components: {
        list: () => import('@/components/admin/CompaniesList.vue'),
      },
    },
    {
      path: 'new',
      name: 'company-create',
      components: {
        new: () => import('src/pages/admin/CompanyEditPage.vue'),
      },
    },
    {
      path: ':id',
      name: 'company-edit',
      components: {
        edit: () => import('src/pages/admin/CompanyEditPage.vue'),
      },
    },
  ],
};
