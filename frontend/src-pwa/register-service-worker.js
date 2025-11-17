import { register } from 'register-service-worker';
import { Notify } from 'quasar';

register(process.env.SERVICE_WORKER_FILE, {
  ready() {
    console.log('Service Worker is active.');
    console.log('App is ready to work offline.');
  },

  registered() {
    console.log('Service Worker has been registered.');
  },

  cached() {
    console.log('Content has been cached for offline use.');
  },

  updatefound() {
    console.log('New content is downloading.');
  },

  updated(registration) {
    console.log('New content is available.');

    Notify.create({
      message: 'Доступне оновлення застосунку',
      color: 'primary',
      icon: 'mdi-update',
      timeout: 0,
      actions: [
        {
          label: 'Оновити',
          color: 'white',
          handler: () => {
            if (registration && registration.waiting) {
              registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
            window.location.reload();
          },
        },
        {
          label: 'Пізніше',
          color: 'white',
        },
      ],
    });
  },

  offline() {
    console.log('No internet connection found. App is running in offline mode.');
  },

  error(err) {
    console.error('Error during service worker registration:', err);
  },
});
