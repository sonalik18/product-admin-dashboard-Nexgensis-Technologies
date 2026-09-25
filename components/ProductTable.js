import Link from "next/link";

function ProductActions({ product, onDelete }) {
  return (
    <div className="flex gap-2">
      <Link href={`/products/${product.id}`} className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-slate-50">View</Link>
      <Link href={`/products/${product.id}/edit`} className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-slate-50">Edit</Link>
      <button onClick={() => onDelete(product)} className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white">Delete</button>
    </div>
  );
}

export default function ProductTable({ products, onDelete }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-600">
            <tr>
              <th className="p-4">Product</th><th className="p-4">Category</th><th className="p-4">Price</th>
              <th className="p-4">Rating</th><th className="p-4">Stock</th><th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="p-4"><div className="flex items-center gap-3"><img src={p.thumbnail} alt="" className="h-12 w-12 rounded-lg object-cover" /><span className="font-medium">{p.title}</span></div></td>
                <td className="p-4">{p.category}</td><td className="p-4">${p.price}</td><td className="p-4">⭐ {p.rating}</td><td className="p-4">{p.stock}</td>
                <td className="p-4"><ProductActions product={p} onDelete={onDelete} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-4 md:hidden">
        {products.map((p) => (
          <div key={p.id} className="rounded-xl border bg-white p-4">
            <div className="flex gap-3">
              <img src={p.thumbnail} alt="" className="h-20 w-20 rounded-lg object-cover" />
              <div className="min-w-0"><h3 className="font-semibold">{p.title}</h3><p className="text-sm text-slate-500">{p.category}</p></div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm"><div>Price<br/><b>${p.price}</b></div><div>Rating<br/><b>⭐ {p.rating}</b></div><div>Stock<br/><b>{p.stock}</b></div></div>
            <div className="mt-4"><ProductActions product={p} onDelete={onDelete} /></div>
          </div>
        ))}
      </div>
    </>
  );
}