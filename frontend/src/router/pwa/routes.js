const routes = [
  {
    path: '/',
    alias: ['/home', '/index'],
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        name: 'index',
        path: '',
        component: () => import('@/pages/pwa/TemplatesListPage.vue'),
      },
      {
        name: 'audit-perform',
        path: '/audit/:id',
        component: () => import('@/pages/pwa/AuditPerformPage.vue'),
        children: [
          {
            path: 'photos/:num',
            name: `audit-perform:photos`,
            components: {
              photos: () => import('@/pages/PhotosPage.vue'),
            },
            meta: {
              parentRoute: 'audit-perform',
            },
          },
        ],
      },
      {
        name: 'audits-in-progress',
        path: '/audits-in-progress',
        component: () => import('@/pages/pwa/AuditsInProgressPage.vue'),
        meta: {
          menu: true,
          icon: 'mdi-progress-clock',
          i18n: 'auditsInProgress',
        },
      },
      {
        name: 'user_profile',
        path: '/user_profile',
        component: () => import('@/pages/UserProfile.vue'),
      },
      {
        name: 'user_settings',
        path: '/user_settings',
        component: () => import('@/pages/UserSettings.vue'),
      },
    ],
  },
  {
    path: '/login',
    component: () => import('@/layouts/GuestLayout.vue'),
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('@/pages/LoginPage.vue'),
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
];

export default routes;
