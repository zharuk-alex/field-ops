export const QUESTION_TYPES = Object.freeze([
  "boolean",
  "choice",
  "multipleChoice",
  "number",
  "photo",
  "rating",
  "text",
]);

export const TEMPLATES_ALLOWED_SORT = Object.freeze([
  "createdAt",
  "name",
  "status",
  "companyName",
  "description",
]);

export const QUESTION_STATUSES = Object.freeze(["active", "inactive"]);

export const QUESTIONS_ALLOWED_SORT = Object.freeze([
  "questionText",
  "type",
  "status",
  "createdAt",
  "companyName",
]);

export const COMPANY_ALLOWED_SORT = Object.freeze([
  "name",
  "createdAt",
  "updatedAt",
  "locale",
  "timezone",
  "id",
]);

export const LOCATIONS_ALLOWED_SORT = Object.freeze([
  "name",
  "createdAt",
  "companyId",
  "status",
  "companyName",
]);

export const USERS_ALLOWED_SORT = Object.freeze([
  "createdAt",
  "email",
  "firstName",
  "lastName",
  "role",
  "status",
  "companyName",
]);

export const AUDITS_ALLOWED_SORT = Object.freeze([
  "createdAt",
  "updatedAt",
  "status",
  "startsAt",
  "endsAt",
  "companyName",
  "locationName",
  "templateName",
  "assigneeName",
]);

export const AUDITS_STATUS = Object.freeze([
  "draft",
  "open",
  "in_progress",
  "submitted",
  "reviewed",
  "closed",
]);
