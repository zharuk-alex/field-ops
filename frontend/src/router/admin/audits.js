export default {
  path: '/audits',
  name: 'audits',
  component: () => import('@/layouts/ListAndCrudLayout.vue'),
  meta: {
    title: 'Audits',
    i18n: 'audit',
    userRole: 'admin',
    // menu: true,
    menu: false,
  },
  children: [
    {
      path: '',
      name: 'audits-list',
      components: {
        list: () => import('@/components/admin/AuditsList.vue'),
      },
    },
    {
      path: 'new',
      name: 'audit-create',
      components: {
        new: () => import('@/pages/admin/Audits/AuditEditPage.vue'),
      },
    },
    {
      path: ':id',
      name: 'audit-view',
      components: {
        view: () => import('@/pages/admin/Audits/AuditViewPage.vue'),
      },
    },
  ],
};
