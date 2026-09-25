import api from "@/lib/axios";

export async function getProducts({ limit, skip, search, category, sortBy, order, signal }) {
  const params = { limit, skip };
  if (sortBy) {
    params.sortBy = sortBy;
    params.order = order || "asc";
  }

  // DummyJSON does not support search + category filtering in one request.
  // The UI disables the category selector while search is active.
  const endpoint = search
    ? "/products/search"
    : category
      ? `/products/category/${encodeURIComponent(category)}`
      : "/products";

  if (search) params.q = search;

  const { data } = await api.get(endpoint, { params, signal });
  return data;
}

export async function getCategories() {
  const { data } = await api.get("/products/categories");
  return data;
}

export async function getProduct(id) {
  const { data } = await api.get(`/products/${id}`);
  return data;
}

export async function createProduct(product) {
  const { data } = await api.post("/products/add", product);
  return data;
}

export async function updateProduct(id, product) {
  const { data } = await api.put(`/products/${id}`, product);
  return data;
}

export async function deleteProduct(id) {
  const { data } = await api.delete(`/products/${id}`);
  return data;
}