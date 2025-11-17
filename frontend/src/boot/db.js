import Dexie from 'dexie';

export const db = new Dexie('FieldOpsDB');

db.version(1).stores({
  templates: 'id, companyId, name, status',
  audits: 'localId, templateId, status, startedAt',
  auditsData: 'localId, templateId, locationId, [templateId+locationId]',
  photos: '++id, auditLocalId, [auditLocalId+questionId], hash',
});

db.version(2).stores({
  templates: 'id, companyId, name, status',
  audits: null,
  auditsData: 'localId, templateId, locationId, [templateId+locationId]',
  photos: '++id, auditLocalId, [auditLocalId+questionId], hash',
});

export const templatesTable = db.templates;
export const auditsDataTable = db.auditsData;
export const photosTable = db.photos;

export const ensurePersistence = async function () {
  if (navigator.storage?.persist) {
    const already = await navigator.storage.persisted();
    if (!already) {
      await navigator.storage.persist();
    }
  }
};

ensurePersistence();
