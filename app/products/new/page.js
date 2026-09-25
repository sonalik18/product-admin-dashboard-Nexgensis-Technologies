"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/lib/api/products";
import ProductForm from "@/components/ProductForm";
import { saveAddedProduct } from "@/lib/localProducts";

export default function NewProductPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function submit(product) {
    if (submitting) return;

    setSubmitting(true);

    try {
      const created = await createProduct(product);

      const saved = {
        ...created,
        ...product,
      };

      // Save locally because DummyJSON does not permanently save POST changes
      saveAddedProduct(saved);

      // Go directly to Dashboard
      router.push("/products");
      router.refresh();
    } catch (err) {
      alert(
        err.userMessage || "Could not create product."
      );

      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold">
        Add Product
      </h1>

      <ProductForm
        onSubmit={submit}
        submitting={submitting}
      />
    </div>
  );
}