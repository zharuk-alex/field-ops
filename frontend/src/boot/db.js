import Dexie from 'dexie';

export const db = new Dexie('FieldOpsDB');

db.version(1).stores({
  templates: 'id, companyId, name, status',
  audits: 'localId, templateId, status, startedAt',
  auditsData: 'localId, templateId, locationId, [templateId+locationId]',
  photos: '++id, auditLocalId, [auditLocalId+questionId], hash',
});

export const templatesTable = db.templates;
export const auditsTable = db.audits;
export const auditsDataTable = db.auditsData;
export const photosTable = db.photos;
