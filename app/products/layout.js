import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";

export default function ProductsLayout({ children }) {
  return <ProtectedRoute><Header /><main className="mx-auto max-w-7xl px-4 py-6">{children}</main></ProtectedRoute>;
}