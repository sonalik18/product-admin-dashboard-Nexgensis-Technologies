export default function Pagination({ page, totalPages, pageSize, total, onPage, onPageSize }) {
  const start = total ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(page * pageSize, total);

  const pages = [];
  const from = Math.max(1, page - 2);
  const to = Math.min(totalPages, page + 2);
  for (let i = from; i <= to; i++) pages.push(i);

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-white p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span className="text-slate-600">Showing {start}–{end} of {total}</span>
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-slate-600">Page size
          <select value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))} className="ml-2 rounded-md border px-2 py-1.5">
            {[10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <button disabled={page <= 1} onClick={() => onPage(page - 1)} className="rounded-md border px-3 py-1.5">Previous</button>
        {pages.map(n => <button key={n} onClick={() => onPage(n)} className={`rounded-md border px-3 py-1.5 ${n === page ? "bg-slate-900 text-white" : ""}`}>{n}</button>)}
        <button disabled={page >= totalPages} onClick={() => onPage(page + 1)} className="rounded-md border px-3 py-1.5">Next</button>
      </div>
    </div>
  );
}