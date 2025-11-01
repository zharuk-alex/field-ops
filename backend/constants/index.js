export const QUESTION_TYPES = Object.freeze([
  "boolean",
  "choice",
  "number",
  "photo",
  "rating",
  "text",
]);

export const QUESTION_STATUSES = Object.freeze(["active", "inactive"]);

export const QUESTIONS_ALLOWED_SORT = Object.freeze([
  "questionText",
  "type",
  "status",
  "createdAt",
  "companyId",
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
