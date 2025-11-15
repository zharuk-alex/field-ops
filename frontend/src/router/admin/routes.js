import templates from './templates.js';
import questions from './questions.js';
import locations from './locations.js';
import users from './users.js';
import audits from './audits.js';
import companies from './companies.js';

const routes = [
  {
    path: '/',
    alias: ['/home', '/index'],
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/pages/admin/IndexPage.vue'),
      },
      audits,
      templates,
      companies,
      questions,
      locations,
      users,
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
