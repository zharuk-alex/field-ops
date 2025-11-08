import { createStore, createLogger } from 'vuex';
import auth from './modules/auth.js';
import text from './modules/text.js';
import uiServices from './modules/ui-services.js';

import hydratePlugin from './plugins/hydrate.js';
// import persistPlugin from './plugins/persist.js'

const BUILD_TARGET = import.meta.env.VITE_BUILD_TARGET || 'pwa';
const isDev = import.meta.env.DEV === true;

const plugins = [hydratePlugin];
// if (BUILD_TARGET === 'pwa') plugins.push(persistPlugin)
if (isDev) plugins.push(createLogger());

const store = createStore({
  strict: isDev,
  modules: {
    auth,
    text,
    uiServices,
  },
  plugins,
});

if (BUILD_TARGET === 'admin') {
  import('./modules/admin/users.js').then(m => {
    store.registerModule('adminUsers', m.default);
  });
  import('./modules/admin/templates.js').then(m => {
    store.registerModule('adminTemplates', m.default);
  });
  import('./modules/admin/questions.js').then(m => {
    store.registerModule('adminQuestions', m.default);
  });
  import('./modules/admin/companies.js').then(m => {
    store.registerModule('adminCompanies', m.default);
  });
  import('./modules/admin/locations.js').then(m => {
    store.registerModule('adminLocations', m.default);
  });
  import('./modules/admin/audits.js').then(m => {
    store.registerModule('adminAudits', m.default);
  });
} else {
  import('./modules/pwa/templates.js').then(m => {
    store.registerModule('pwaTemplates', m.default);
  });
  import('./modules/pwa/audits.js').then(m => {
    store.registerModule('pwaAudits', m.default);
  });
  import('./modules/pwa/filters.js').then(m => {
    store.registerModule('pwaFilters', m.default);
  });
}

export default store;
