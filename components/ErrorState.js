export default function ErrorState({ message = "Unable to load data.", onRetry }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="font-medium text-red-700">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white">
          Retry
        </button>
      )}
    </div>
  );
}