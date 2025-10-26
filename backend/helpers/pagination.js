export function getPagination(query) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export function getPagingData(result, page, limit) {
  const { count, rows } = result;
  const totalPages = Math.ceil(count / limit);
  return { total: count, page, totalPages, limit, items: rows };
}
