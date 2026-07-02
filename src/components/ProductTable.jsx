export default function ProductTable({ products, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="max-h-[550px] overflow-y-auto">
        <table className="w-full border-collapse">
          {/* HEADER */}
          <thead className="sticky top-0 bg-gray-100 z-10">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Category</th>
              <th className="text-left p-4">Cost Price</th>
              <th className="text-left p-4">Selling Price</th>
              <th className="text-center p-4">Stock</th>
              <th className="text-center p-4">Actions</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-5 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  {/* Name */}
                  <td className="p-4 font-medium">{product.name}</td>

                  {/* Category */}
                  <td className="p-4">{product.categories?.name ?? "-"}</td>

                  {/* Cost */}
                  <td className="p-4">
                    ₱{Number(product.cost_price).toFixed(2)}
                  </td>

                  {/* Selling */}
                  <td className="p-4 font-semibold text-green-600">
                    ₱{Number(product.selling_price).toFixed(2)}
                  </td>

                  {/* Stock */}
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        product.stock <= 5
                          ? "bg-red-100 text-red-700"
                          : product.stock <= 15
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onEdit(product)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => onDelete(product.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
