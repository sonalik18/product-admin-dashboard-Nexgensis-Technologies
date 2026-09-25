"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProduct } from "@/lib/api/products";
import { getLocalProduct } from "@/lib/localProducts";
import Loader from "@/components/Loader";
import ErrorState from "@/components/ErrorState";

export default function ProductDetails({ params }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      setLoading(true);
      setError("");

      const local = getLocalProduct(params.id);
      if (local) {
        if (active) {
          setProduct(local);
          setLoading(false);
        }
        return;
      }

      try {
        const data = await getProduct(params.id);
        if (active) setProduct(data);
      } catch (err) {
        if (active) {
          setError(
            err.response?.status === 404
              ? "notfound"
              : err.userMessage || "Could not load product."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProduct();
    return () => {
      active = false;
    };
  }, [params.id]);

  if (loading) return <Loader />;

  if (error === "notfound") {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <h1 className="text-3xl font-bold">Product not found</h1>
        <p className="mt-2 text-slate-500">The product ID does not exist.</p>
        <Link
          href="/products"
          className="mt-5 inline-block rounded-lg bg-slate-900 px-4 py-2 text-white"
        >
          Back to products
        </Link>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link href="/products" className="text-sm font-medium text-slate-600">
          ← Back to products
        </Link>
        <Link
          href={`/products/${product.id}/edit`}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Edit Product
        </Link>
      </div>

      <div className="grid gap-6 rounded-2xl border bg-white p-6 lg:grid-cols-2">
        <div className="grid gap-3 sm:grid-cols-2">
          {(product.images || [product.thumbnail]).map((img, i) => (
            <img
              key={i}
              src={img}
              alt={product.title}
              className="h-64 w-full rounded-xl bg-slate-50 object-contain"
            />
          ))}
        </div>

        <div>
          <p className="text-sm uppercase text-slate-500">{product.category}</p>
          <h1 className="mt-1 text-3xl font-bold">{product.title}</h1>
          <p className="mt-4 text-slate-600">{product.description}</p>

          <div className="mt-5 flex gap-5">
            <span className="text-2xl font-bold">${product.price}</span>
            <span>⭐ {product.rating || "N/A"}</span>
            <span>Stock: {product.stock}</span>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold">Reviews</h2>
            <div className="mt-3 space-y-3">
              {product.reviews?.length ? (
                product.reviews.map((r, i) => (
                  <div key={i} className="rounded-lg bg-slate-50 p-4">
                    <b>{r.reviewerName}</b>
                    <span className="ml-2">⭐ {r.rating}</span>
                    <p className="mt-1 text-sm text-slate-600">{r.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No reviews available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
