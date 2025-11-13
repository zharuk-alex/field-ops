export default {
  path: '/audits',
  name: 'admin:audits',
  redirect: { name: 'admin:audits:list' },
  meta: {
    title: 'Audits',
    i18n: 'audits',
    userRole: ['admin', 'manager'],
    menu: true,
  },
  children: [
    {
      path: '',
      name: 'admin:audits:list',
      component: () => import('@/pages/admin/Audits/AuditsListPage.vue'),
      meta: {
        title: 'Audits List',
        i18n: 'audits',
      },
    },
    {
      path: ':id(.*)',
      name: 'admin:audit:view',
      component: () => import('@/pages/admin/Audits/AuditDetailPage.vue'),
      meta: {
        title: 'Audit Details',
        i18n: 'auditDetails',
      },
    },
  ],
};
