import { Pencil, Trash2, Package } from "lucide-react";

export default function ProductTable({
  products,
  categories,
  onEdit,
  onDelete,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
      <div className="max-h-[500px] overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-20 bg-gray-50 backdrop-blur border-b border-gray-200">
            <tr className="text-sm uppercase tracking-wider text-gray-700">
              <th className="px-6 py-4 text-left">Product</th>
              <th className="px-6 py-4 text-left">Category</th>
              <th className="px-6 py-4 text-right">Cost</th>
              <th className="px-6 py-4 text-right">Selling</th>
              <th className="px-6 py-4 text-center">Stock</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-gray-500">
                  <Package size={42} className="mx-auto mb-3 text-gray-300" />
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const badge =
                  product.stock <= 5
                    ? "bg-red-100 text-red-700"
                    : product.stock <= 15
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700";

                return (
                  <tr
                    key={product.id}
                    className="group border-b border-gray-100 transition hover:bg-orange-50/40 hover:border-l-4 hover:border-l-orange-500"
                  >
                    <td className="px-6 py-5">
                      <p className="font-semibold text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-400">Product Item</p>
                    </td>

                    <td className="px-6 py-5 text-gray-600">
                      {categories.find(
                        (category) => category.id === product.category_id,
                      )?.name ?? "-"}
                    </td>

                    <td className="px-6 py-5 text-right font-medium">
                      ₱{Number(product.cost_price).toFixed(2)}
                    </td>

                    <td className="px-6 py-5 text-right font-bold text-green-600">
                      ₱{Number(product.selling_price).toFixed(2)}
                    </td>

                    <td className="px-6 py-5 text-center">
                      <span
                        className={`inline-flex min-w-[50px] justify-center rounded-full px-3 py-1 text-xs font-semibold ${badge}`}
                      >
                        {product.stock}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => onEdit(product)}
                          className="rounded-xl border border-gray-200 p-2 text-amber-500 transition hover:bg-amber-50 hover:border-amber-300"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() => onDelete(product.id)}
                          className="rounded-xl border border-gray-200 p-2 text-red-500 transition hover:bg-red-50 hover:border-red-300"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
