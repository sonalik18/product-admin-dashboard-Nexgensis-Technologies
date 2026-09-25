// "use client";

// import { useCallback, useEffect, useMemo, useState } from "react";
// import { usePathname, useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { getCategories, getProducts, deleteProduct } from "@/lib/api/products";
// import { getLocalProducts, productMatches, saveDeletedProduct } from "@/lib/localProducts";
// import ProductTable from "@/components/ProductTable";
// import Pagination from "@/components/Pagination";
// import Loader from "@/components/Loader";
// import ErrorState from "@/components/ErrorState";
// import EmptyState from "@/components/EmptyState";

// const VALID_SIZES = [10,20,50];
// const SORTS = ["", "price", "rating", "title"];

// function safeInt(value, fallback, min = 1) {
//   const n = Number(value);
//   return Number.isInteger(n) && n >= min ? n : fallback;
// }

// export default function ProductsPage() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const sp = useSearchParams();
//   const requestedPage = safeInt(sp.get("page"), 1);
//   const pageSize = VALID_SIZES.includes(Number(sp.get("pageSize"))) ? Number(sp.get("pageSize")) : 10;
//   const search = sp.get("search") || "";
//   const category = sp.get("category") || "";
//   const sortBy = SORTS.includes(sp.get("sort")) ? sp.get("sort") : "";
//   const order = sp.get("order") === "desc" ? "desc" : "asc";

//   const [searchInput, setSearchInput] = useState(search);
//   const [products, setProducts] = useState([]);
//   const [total, setTotal] = useState(0);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [categoryLoading, setCategoryLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [mutating, setMutating] = useState(false);

//   useEffect(() => setSearchInput(search), [search]);

//   const updateParams = useCallback((changes) => {
//     const next = new URLSearchParams(sp.toString());
//     Object.entries(changes).forEach(([key, value]) => {
//       if (value === "" || value === null || value === undefined) next.delete(key);
//       else next.set(key, String(value));
//     });
//     router.push(`${pathname}?${next.toString()}`);
//   }, [router, pathname, sp]);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (searchInput !== search) updateParams({ search: searchInput.trim(), page: 1 });
//     }, 500);
//     return () => clearTimeout(timer);
//   }, [searchInput, search, updateParams]);

//   useEffect(() => {
//     let active = true;
//     getCategories().then(data => {
//       if (active) setCategories(Array.isArray(data) ? data : data.map?.(x => x.slug || x.name) || []);
//     }).catch(() => {}).finally(() => active && setCategoryLoading(false));
//     return () => { active = false; };
//   }, []);

//   const load = useCallback(async (signal) => {
//     setLoading(true); setError("");
//     try {
//       const data = await getProducts({ limit: pageSize, skip: (requestedPage-1)*pageSize, search, category: search ? "" : category, sortBy, order, signal });
//       if (signal.aborted) return;

//       const local = getLocalProducts();
//       const updatedById = new Map(local.updated.map((p) => [String(p.id), p]));

//       const apiProducts = (data.products || [])
//         .filter((p) => !local.deletedIds.has(String(p.id)))
//         .map((p) => updatedById.get(String(p.id)) || p);

//       const existingIds = new Set(apiProducts.map((p) => String(p.id)));
//       const localExtras = [...local.added, ...local.updated]
//         .filter((p, index, array) => array.findIndex((x) => String(x.id) === String(p.id)) === index)
//         .filter((p) => !existingIds.has(String(p.id)))
//         .filter((p) => productMatches(p, { search, category: search ? "" : category }));

//       const extrasAllowedOnPage = requestedPage === 1 || search || category ? localExtras : [];
//       let merged = [...apiProducts, ...extrasAllowedOnPage];

//       if (sortBy) {
//         merged.sort((a, b) => {
//           const av = sortBy === "title" ? String(a.title || "").toLowerCase() : Number(a[sortBy] || 0);
//           const bv = sortBy === "title" ? String(b.title || "").toLowerCase() : Number(b[sortBy] || 0);
//           const comparison = av < bv ? -1 : av > bv ? 1 : 0;
//           return order === "desc" ? -comparison : comparison;
//         });
//       }

//       setProducts(merged.slice(0, pageSize));

//       const matchingAdded = local.added.filter((p) => productMatches(p, { search, category: search ? "" : category }));
//       const matchingUpdatedExtras = local.updated.filter((p) => !existingIds.has(String(p.id)) && productMatches(p, { search, category: search ? "" : category }));
//       const matchingDeleted = local.deleted.filter((p) => productMatches(p, { search, category: search ? "" : category }));
//       const calculatedTotal = Math.max(0, Number(data.total || 0) + matchingAdded.length + matchingUpdatedExtras.length - matchingDeleted.length);
//       setTotal(calculatedTotal);

//       const maxPage = Math.max(1, Math.ceil(calculatedTotal / pageSize));
//       if (requestedPage > maxPage) {
//         updateParams({ page: maxPage });
//       }
//     } catch (err) {
//       if (signal.aborted || err.code === "ERR_CANCELED") return;
//       setError(err.userMessage || "Could not load products.");
//     } finally {
//       if (!signal.aborted) setLoading(false);
//     }
//   }, [requestedPage, pageSize, search, category, sortBy, order, updateParams]);

//   useEffect(() => {
//     const controller = new AbortController();
//     load(controller.signal);
//     return () => controller.abort();
//   }, [load]);

//   const totalPages = Math.max(1, Math.ceil(total / pageSize));
//   const safePage = Math.min(requestedPage, totalPages);

//   async function handleDelete(product) {
//     if (!window.confirm(`Delete "${product.title}"?`)) return;
//     setMutating(true);
//     try {
//       await deleteProduct(product.id);
//       saveDeletedProduct(product);
//       setProducts(prev => prev.filter(p => String(p.id) !== String(product.id)));
//       setTotal(t => Math.max(0, t - 1));
//     } catch (err) {
//       alert(err.userMessage || "Delete failed.");
//     } finally { setMutating(false); }
//   }

//   const categoryOptions = useMemo(() => categories.map(c => typeof c === "string" ? c : c.slug || c.name), [categories]);

//   return (
//     <div className="space-y-5">
//       <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
//         <div><h1 className="text-2xl font-bold">Products</h1><p className="text-sm text-slate-500">Manage your product catalog.</p></div>
//         <Link href="/products/new" className="rounded-lg bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white">+ Add Product</Link>
//       </div>

//       <section className="grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-[1fr_200px_180px_150px]">
//         <input value={searchInput} onChange={e=>setSearchInput(e.target.value)} placeholder="Search products..." className="rounded-lg border px-3 py-2" />
//         <select disabled={!!search} value={category} onChange={e=>updateParams({category:e.target.value, page:1})} className="rounded-lg border px-3 py-2">
//           <option value="">All categories</option>{categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
//         </select>
//         <select value={sortBy} onChange={e=>updateParams({sort:e.target.value, page:1})} className="rounded-lg border px-3 py-2">
//           <option value="">Sort: Default</option>{SORTS.slice(1).map(s=><option key={s} value={s}>{`Sort: ${s}`}</option>)}
//         </select>
//         <select disabled={!sortBy} value={order} onChange={e=>updateParams({order:e.target.value, page:1})} className="rounded-lg border px-3 py-2">
//           <option value="asc">Ascending</option><option value="desc">Descending</option>
//         </select>
//         {search && <p className="md:col-span-4 text-xs text-amber-700">Category filter is disabled during search because DummyJSON does not support search + category in one API request.</p>}
//       </section>

//       {mutating && <div className="text-xs text-slate-500">Saving catalog change...</div>}
//       {loading ? <Loader label="Loading products..." /> : error ? <ErrorState message={error} onRetry={() => load(new AbortController().signal)} /> : products.length === 0 ? <EmptyState message={search ? `No products found for "${search}".` : "No products found."} /> : <ProductTable products={products} onDelete={handleDelete} />}
//       {!loading && !error && total > 0 && <Pagination page={safePage} totalPages={totalPages} pageSize={pageSize} total={total} onPage={n=>updateParams({page:n})} onPageSize={n=>updateParams({pageSize:n,page:1})} />}
//       {categoryLoading && <span className="hidden">Loading categories...</span>}
//     </div>
//   );
// }




"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import Link from "next/link";

import {
  getCategories,
  getProducts,
  deleteProduct,
} from "@/lib/api/products";

import {
  getLocalProducts,
  productMatches,
  saveDeletedProduct,
} from "@/lib/localProducts";

import ProductTable from "@/components/ProductTable";
import Pagination from "@/components/Pagination";
import Loader from "@/components/Loader";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

const VALID_SIZES = [10, 20, 50];

const SORTS = [
  "",
  "price",
  "rating",
  "title",
];

function safeInt(value, fallback, min = 1) {
  const n = Number(value);

  return Number.isInteger(n) && n >= min
    ? n
    : fallback;
}

export default function ProductsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const requestedPage = safeInt(
    sp.get("page"),
    1
  );

  const pageSize = VALID_SIZES.includes(
    Number(sp.get("pageSize"))
  )
    ? Number(sp.get("pageSize"))
    : 10;

  const search = sp.get("search") || "";

  const category = sp.get("category") || "";

  const sortBy = SORTS.includes(
    sp.get("sort")
  )
    ? sp.get("sort")
    : "";

  const order =
    sp.get("order") === "desc"
      ? "desc"
      : "asc";

  const [searchInput, setSearchInput] =
    useState(search);

  const [products, setProducts] =
    useState([]);

  const [total, setTotal] =
    useState(0);

  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [categoryLoading, setCategoryLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [mutating, setMutating] =
    useState(false);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Update URL parameters
  const updateParams = useCallback(
    (changes) => {
      const next = new URLSearchParams(
        sp.toString()
      );

      Object.entries(changes).forEach(
        ([key, value]) => {
          if (
            value === "" ||
            value === null ||
            value === undefined
          ) {
            next.delete(key);
          } else {
            next.set(
              key,
              String(value)
            );
          }
        }
      );

      const query =
        next.toString();

      router.push(
        query
          ? `${pathname}?${query}`
          : pathname
      );
    },
    [
      router,
      pathname,
      sp,
    ]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateParams({
          search: searchInput.trim(),
          page: 1,
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [
    searchInput,
    search,
    updateParams,
  ]);

  // Load categories
  useEffect(() => {
    let active = true;

    getCategories()
      .then((data) => {
        if (!active) return;

        setCategories(
          Array.isArray(data)
            ? data
            : data.map?.(
                (item) =>
                  item.slug ||
                  item.name
              ) || []
        );
      })
      .catch(() => {})
      .finally(() => {
        if (active) {
          setCategoryLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  // Load products
  const load = useCallback(
    async (signal) => {
      setLoading(true);
      setError("");

      try {
        const data =
          await getProducts({
            limit: pageSize,
            skip:
              (requestedPage - 1) *
              pageSize,
            search,
            category: search
              ? ""
              : category,
            sortBy,
            order,
            signal,
          });

        if (signal.aborted) {
          return;
        }

        // Read local changes
        const local =
          getLocalProducts();

        // Updated existing products
        const updatedById =
          new Map(
            local.updated.map(
              (product) => [
                String(product.id),
                product,
              ]
            )
          );

        // API products
        const apiProducts =
          (data.products || [])
            .filter(
              (product) =>
                !local.deletedIds.has(
                  String(product.id)
                )
            )
            .map(
              (product) =>
                updatedById.get(
                  String(product.id)
                ) || product
            );

        const existingIds =
          new Set(
            apiProducts.map(
              (product) =>
                String(product.id)
            )
          );

        // Local products that are not in API
        const localExtras = [
          ...local.added,
          ...local.updated,
        ]
          .filter(
            (product, index, array) =>
              array.findIndex(
                (item) =>
                  String(item.id) ===
                  String(product.id)
              ) === index
          )
          .filter(
            (product) =>
              !existingIds.has(
                String(product.id)
              )
          )
          .filter(
            (product) =>
              productMatches(
                product,
                {
                  search,
                  category: search
                    ? ""
                    : category,
                }
              )
          );

        const extrasAllowedOnPage =
          requestedPage === 1 ||
          search ||
          category
            ? localExtras
            : [];

        let merged = [
          ...apiProducts,
          ...extrasAllowedOnPage,
        ];

        // Local sorting
        if (sortBy) {
          merged.sort(
            (a, b) => {
              const av =
                sortBy === "title"
                  ? String(
                      a.title || ""
                    ).toLowerCase()
                  : Number(
                      a[sortBy] || 0
                    );

              const bv =
                sortBy === "title"
                  ? String(
                      b.title || ""
                    ).toLowerCase()
                  : Number(
                      b[sortBy] || 0
                    );

              const comparison =
                av < bv
                  ? -1
                  : av > bv
                  ? 1
                  : 0;

              return order === "desc"
                ? -comparison
                : comparison;
            }
          );
        }

        // Show only current page
        setProducts(
          merged.slice(
            0,
            pageSize
          )
        );

        // Calculate local totals
        const matchingAdded =
          local.added.filter(
            (product) =>
              productMatches(
                product,
                {
                  search,
                  category: search
                    ? ""
                    : category,
                }
              )
          );

        const matchingUpdatedExtras =
          local.updated.filter(
            (product) =>
              !existingIds.has(
                String(product.id)
              ) &&
              productMatches(
                product,
                {
                  search,
                  category: search
                    ? ""
                    : category,
                }
              )
          );

        const matchingDeleted =
          local.deleted.filter(
            (product) =>
              productMatches(
                product,
                {
                  search,
                  category: search
                    ? ""
                    : category,
                }
              )
          );

        const calculatedTotal =
          Math.max(
            0,
            Number(data.total || 0) +
              matchingAdded.length +
              matchingUpdatedExtras.length -
              matchingDeleted.length
          );

        setTotal(
          calculatedTotal
        );

        // Protect against invalid page number
        const maxPage =
          Math.max(
            1,
            Math.ceil(
              calculatedTotal /
                pageSize
            )
          );

        if (
          requestedPage >
          maxPage
        ) {
          updateParams({
            page: maxPage,
          });
        }
      } catch (err) {
        if (
          signal.aborted ||
          err.code ===
            "ERR_CANCELED"
        ) {
          return;
        }

        setError(
          err.userMessage ||
            "Could not load products."
        );
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    [
      requestedPage,
      pageSize,
      search,
      category,
      sortBy,
      order,
      updateParams,
    ]
  );

  // Load whenever URL state changes
  useEffect(() => {
    const controller =
      new AbortController();

    load(
      controller.signal
    );

    return () =>
      controller.abort();
  }, [load]);

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        total / pageSize
      )
    );

  const safePage =
    Math.min(
      requestedPage,
      totalPages
    );

  // DELETE PRODUCT
  async function handleDelete(
    product
  ) {
    if (
      !window.confirm(
        `Delete "${product.title}"?`
      )
    ) {
      return;
    }

    setMutating(true);

    // IMPORTANT:
    // Save local deletion FIRST.
    // This allows newly added products like ID 195
    // to be deleted even though DummyJSON does not
    // permanently store them.
    saveDeletedProduct(
      product
    );

    // Remove immediately from Dashboard
    setProducts(
      (previous) =>
        previous.filter(
          (item) =>
            String(item.id) !==
            String(product.id)
        )
    );

    setTotal(
      (previous) =>
        Math.max(
          0,
          previous - 1
        )
    );

    try {
      // Try DummyJSON DELETE API
      await deleteProduct(
        product.id
      );
    } catch (err) {
      // DummyJSON may return an error for
      // locally-created products such as ID 195.
      // The local deletion is already saved,
      // so we keep the product deleted.
      console.log(
        "DummyJSON delete is simulated:",
        err.message
      );
    } finally {
      setMutating(false);
    }
  }

  const categoryOptions =
    useMemo(
      () =>
        categories.map(
          (category) =>
            typeof category ===
            "string"
              ? category
              : category.slug ||
                category.name
        ),
      [categories]
    );

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">
            Products
          </h1>

          <p className="text-sm text-slate-500">
            Manage your product
            catalog.
          </p>
        </div>

        <Link
          href="/products/new"
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white"
        >
          + Add Product
        </Link>
      </div>

      {/* Filters */}
      <section className="grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-[1fr_200px_180px_150px]">

        {/* Search */}
        <input
          value={searchInput}
          onChange={(e) =>
            setSearchInput(
              e.target.value
            )
          }
          placeholder="Search products..."
          className="rounded-lg border px-3 py-2"
        />

        {/* Category */}
        <select
          disabled={!!search}
          value={category}
          onChange={(e) =>
            updateParams({
              category:
                e.target.value,
              page: 1,
            })
          }
          className="rounded-lg border px-3 py-2"
        >
          <option value="">
            All categories
          </option>

          {categoryOptions.map(
            (category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            )
          )}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) =>
            updateParams({
              sort: e.target.value,
              page: 1,
            })
          }
          className="rounded-lg border px-3 py-2"
        >
          <option value="">
            Sort: Default
          </option>

          {SORTS.slice(1).map(
            (sort) => (
              <option
                key={sort}
                value={sort}
              >
                Sort: {sort}
              </option>
            )
          )}
        </select>

        {/* Order */}
        <select
          disabled={!sortBy}
          value={order}
          onChange={(e) =>
            updateParams({
              order:
                e.target.value,
              page: 1,
            })
          }
          className="rounded-lg border px-3 py-2"
        >
          <option value="asc">
            Ascending
          </option>

          <option value="desc">
            Descending
          </option>
        </select>

        {/* Search + category note */}
        {search && (
          <p className="md:col-span-4 text-xs text-amber-700">
            Category filter is
            disabled during search
            because DummyJSON does
            not support search +
            category in one API
            request.
          </p>
        )}
      </section>

      {/* Mutation message */}
      {mutating && (
        <div className="text-xs text-slate-500">
          Saving catalog change...
        </div>
      )}

      {/* Product content */}
      {loading ? (
        <Loader
          label="Loading products..."
        />
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={() =>
            load(
              new AbortController()
                .signal
            )
          }
        />
      ) : products.length ===
        0 ? (
        <EmptyState
          message={
            search
              ? `No products found for "${search}".`
              : "No products found."
          }
        />
      ) : (
        <ProductTable
          products={products}
          onDelete={handleDelete}
        />
      )}

      {/* Pagination */}
      {!loading &&
        !error &&
        total > 0 && (
          <Pagination
            page={safePage}
            totalPages={totalPages}
            pageSize={pageSize}
            total={total}
            onPage={(page) =>
              updateParams({
                page,
              })
            }
            onPageSize={(size) =>
              updateParams({
                pageSize: size,
                page: 1,
              })
            }
          />
        )}

      {/* Category loading */}
      {categoryLoading && (
        <span className="hidden">
          Loading categories...
        </span>
      )}
    </div>
  );
}