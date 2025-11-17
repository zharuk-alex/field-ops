/* eslint-env serviceworker */

import { clientsClaim } from 'workbox-core';
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);

cleanupOutdatedCaches();

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24,
      }),
    ],
  }),
);

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 500,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  }),
);

registerRoute(
  ({ request }) =>
    request.destination === 'font' || request.destination === 'style',
  new CacheFirst({
    cacheName: 'fonts-icons-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 365,
      }),
    ],
  }),
);

registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'assets-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
);

if (process.env.MODE !== 'ssr' || process.env.PROD) {
  registerRoute(
    new NavigationRoute(createHandlerBoundToURL(process.env.PWA_FALLBACK_HTML), {
      denylist: [
        new RegExp(process.env.PWA_SERVICE_WORKER_REGEX),
        /workbox-(.)*\.js$/,
        /^\/api\//,
      ],
    }),
  );
}

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
