// src/utils/loadData.js
export default async function loadData(
  serviceFunc,
  targetList,
  page = 1,
  limit = 10,
  refs = {}
) {
  const { loading, total, totalPages } = refs;
  if (loading) loading.value = true;

  try {
    const res = await serviceFunc(page, limit);
    const items = res.data || [];
    const meta = res.meta || {};

    targetList.value = items;
    if (total) total.value = meta.total || items.length;
    if (totalPages)
      totalPages.value =
        meta.totalPages || Math.ceil((meta.total || items.length) / limit);

    return res;
  } catch (err) {
    console.error("loadData error:", err);
    targetList.value = [];
    if (total) total.value = 0;
    if (totalPages) totalPages.value = 0;
    throw err;
  } finally {
    if (loading) loading.value = false;
  }
}
