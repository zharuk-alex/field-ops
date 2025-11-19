export default {
  path: '/questions',
  name: 'questions',
  component: () => import('@/layouts/ListAndCrudLayout.vue'),
  meta: {
    title: 'Questions',
    i18n: 'questions',
    userRole: 'admin',
    menu: true,
  },
  redirect: { name: 'questions-list' },
  children: [
    {
      path: '',
      name: 'questions-list',
      components: {
        list: () => import('src/pages/admin/Questions/QuestionsList.vue'),
      },
    },
    {
      path: 'new',
      name: 'question-create',
      components: {
        new: () => import('src/pages/admin/Questions/QuestionEditPage.vue'),
      },
      meta: {
        i18n: 'create',
      },
    },
    {
      path: ':id',
      name: 'question-edit',
      components: {
        edit: () => import('src/pages/admin/Questions/QuestionEditPage.vue'),
      },
      meta: {
        i18n: 'edit',
      },
    },
  ],
};
