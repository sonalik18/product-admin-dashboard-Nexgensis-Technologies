"use client";

import { useEffect, useState } from "react";

const empty = {
  title: "",
  description: "",
  price: "",
  category: "",
  stock: "",
  thumbnail: "",
};

export default function ProductForm({ initial = empty, onSubmit, submitting }) {
  const [form, setForm] = useState({ ...empty, ...initial });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm({ ...empty, ...initial });
    setErrors({});
  }, [initial]);

  function change(e) {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  }

  function submit(e) {
    e.preventDefault();
    if (submitting) return;

    const nextErrors = {};

    if (!form.title.trim()) nextErrors.title = "Title is required.";
    if (!form.description.trim()) nextErrors.description = "Description is required.";
    if (!form.category.trim()) nextErrors.category = "Category is required.";
    if (form.price === "" || Number(form.price) < 0) {
      nextErrors.price = "Enter a valid non-negative price.";
    }
    if (
      form.stock === "" ||
      Number(form.stock) < 0 ||
      !Number.isInteger(Number(form.stock))
    ) {
      nextErrors.stock = "Enter a valid whole-number stock.";
    }
    if (!form.thumbnail.trim()) nextErrors.thumbnail = "Image URL is required.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    onSubmit({
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      thumbnail: form.thumbnail.trim(),
      images: [form.thumbnail.trim()],
    });
  }

  function field(name, label, type = "text") {
    return (
      <div>
        <label className="mb-1 block text-sm font-medium">{label}</label>
        <input
          name={name}
          type={type}
          value={form[name]}
          onChange={change}
          className="w-full rounded-lg border px-3 py-2"
        />
        {errors[name] && (
          <p className="mt-1 text-xs text-red-600">{errors[name]}</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-5 rounded-xl border bg-white p-6">
      {field("title", "Title")}

      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={change}
          rows="4"
          className="w-full rounded-lg border px-3 py-2"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600">{errors.description}</p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {field("category", "Category")}
        {field("price", "Price", "number")}
        {field("stock", "Stock", "number")}
        {field("thumbnail", "Image URL")}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Saving..." : "Save Product"}
      </button>
    </form>
  );
}
