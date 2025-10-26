const routes = [
  {
    path: '/',
    alias: ['/home', '/index'],
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { name: 'index', path: '', component: () => import('@/pages/pwa/IndexPage.vue') },
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
]

export default routes
