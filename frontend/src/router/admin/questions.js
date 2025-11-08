export default {
  path: '/questions',
  name: 'questions',
  component: () => import('@/layouts/ListAndCrudLayout.vue'),
  meta: {
    title: 'Questions',
    i18n: 'question',
    userRole: 'admin',
    menu: true,
  },
  children: [
    {
      path: '',
      name: 'questions-list',
      components: {
        list: () => import('@/components/admin/QuestionsList.vue'),
      },
    },
    {
      path: 'new',
      name: 'question-create',
      components: {
        new: () => import('src/pages/admin/QuestionEditPage.vue'),
      },
    },
    {
      path: ':id',
      name: 'question-edit',
      components: {
        edit: () => import('src/pages/admin/QuestionEditPage.vue'),
      },
    },
  ],
};
