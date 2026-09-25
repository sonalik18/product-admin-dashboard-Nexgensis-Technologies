// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { getProduct, updateProduct } from "@/lib/api/products";
// import {
//   getLocalProduct,
//   saveUpdatedProduct,
// } from "@/lib/localProducts";
// import ProductForm from "@/components/ProductForm";
// import Loader from "@/components/Loader";

// export default function EditProductPage({ params }) {
//   const router = useRouter();

//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     let active = true;

//     async function load() {
//       setLoading(true);
//       setError("");

//       const local = getLocalProduct(params.id);

//       if (local) {
//         if (active) {
//           setProduct(local);
//           setLoading(false);
//         }
//         return;
//       }

//       try {
//         const data = await getProduct(params.id);

//         if (active) {
//           setProduct(data);
//         }
//       } catch (err) {
//         if (active) {
//           setError(
//             err.userMessage || "Could not load product."
//           );
//         }
//       } finally {
//         if (active) {
//           setLoading(false);
//         }
//       }
//     }

//     load();

//     return () => {
//       active = false;
//     };
//   }, [params.id]);

//   async function submit(values) {
//     if (submitting) return;

//     setSubmitting(true);

//     try {
//       const updated = await updateProduct(params.id, values);

//       const saved = {
//         ...product,
//         ...updated,
//         ...values,
//         id: product.id,
//       };

//       // Save the updated product locally
//       saveUpdatedProduct(saved);

//       // Go back to dashboard
//       router.push("/products");
//       router.refresh();
//     } catch (err) {
//       alert(
//         err.userMessage || "Could not update product."
//       );

//       setSubmitting(false);
//     }
//   }

//   if (loading) {
//     return <Loader />;
//   }

//   if (error) {
//     return <p className="text-red-600">{error}</p>;
//   }

//   if (!product) {
//     return <p>Product not found.</p>;
//   }

//   return (
//     <div className="mx-auto max-w-2xl space-y-5">
//       <h1 className="text-2xl font-bold">
//         Edit Product
//       </h1>

//       <ProductForm
//         initial={{
//           title: product.title || "",
//           description: product.description || "",
//           price: product.price ?? "",
//           category: product.category || "",
//           stock: product.stock ?? "",
//           thumbnail:
//             product.thumbnail ||
//             product.images?.[0] ||
//             "",
//         }}
//         onSubmit={submit}
//         submitting={submitting}
//       />
//     </div>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getProduct,
  updateProduct,
} from "@/lib/api/products";
import {
  getLocalProduct,
  saveUpdatedProduct,
} from "@/lib/localProducts";
import ProductForm from "@/components/ProductForm";
import Loader from "@/components/Loader";

export default function EditProductPage({ params }) {
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      setLoading(true);
      setError("");

      // First check localStorage
      const localProduct = getLocalProduct(params.id);

      if (localProduct) {
        if (active) {
          setProduct(localProduct);
          setLoading(false);
        }
        return;
      }

      // If not local, get from DummyJSON
      try {
        const data = await getProduct(params.id);

        if (active) {
          setProduct(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err.userMessage ||
              "Product could not be loaded."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [params.id]);

  async function submit(values) {
    if (submitting) return;

    setSubmitting(true);

    try {
      let updated = {};

      // Try DummyJSON API
      try {
        updated = await updateProduct(
          params.id,
          values
        );
      } catch (apiError) {
        // New products like ID 195 do not exist
        // permanently in DummyJSON.
        console.log(
          "DummyJSON update is simulated for local product."
        );
      }

      // Save the final product locally
      const savedProduct = {
        ...product,
        ...updated,
        ...values,
        id: product.id,
      };

      saveUpdatedProduct(savedProduct);

      // Go back to Dashboard
      router.push("/products");
      router.refresh();
    } catch (err) {
      alert(
        err.userMessage ||
          "Could not update product."
      );

      setSubmitting(false);
    }
  }

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="text-red-600">
        {error}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-red-600">
        Product not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold">
        Edit Product
      </h1>

      <ProductForm
        initial={{
          title: product.title || "",
          description: product.description || "",
          price: product.price ?? "",
          category: product.category || "",
          stock: product.stock ?? "",
          thumbnail:
            product.thumbnail ||
            product.images?.[0] ||
            "",
        }}
        onSubmit={submit}
        submitting={submitting}
      />
    </div>
  );
}