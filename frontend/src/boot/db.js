import Dexie from 'dexie';

export const db = new Dexie('FieldOpsDB');

db.version(1).stores({
  templates: 'id, companyId, name, status',
  auditsData: 'localId, templateId, locationId, [templateId+locationId]',
  photos:
    '++id, auditLocalId, [auditLocalId+questionId], [auditLocalId+status], hash, status',
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
