import { useEffect, useMemo, useState } from "react";
import {
  Package,
  DollarSign,
  Boxes,
  Tag,
  X,
} from "lucide-react";

export default function ProductModal({
  show,
  onClose,
  onSave,
  product,
  categories,
}) {
  const [form, setForm] = useState({
    name: "",
    category_id: "",
    cost_price: "",
    selling_price: "",
    stock: "",
    min_stock: 5,
    status: "Active",
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name ?? "",
        category_id: product.category_id ?? "",
        cost_price: product.cost_price ?? "",
        selling_price: product.selling_price ?? "",
        stock: product.stock ?? "",
        min_stock: product.min_stock ?? 5,
        status: product.status ?? "Active",
      });
    } else {
      setForm({
        name: "",
        category_id: "",
        cost_price: "",
        selling_price: "",
        stock: "",
        min_stock: 5,
        status: "Active",
      });
    }
  }, [product]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const profit = useMemo(() => {
    return (
      Number(form.selling_price || 0) -
      Number(form.cost_price || 0)
    ).toFixed(2);
  }, [form.cost_price, form.selling_price]);

  async function handleSubmit(e) {
    e.preventDefault();

    await onSave({
      name: form.name,
      category_id: form.category_id,
      cost_price: Number(form.cost_price),
      selling_price: Number(form.selling_price),
      stock: Number(form.stock),
      min_stock: Number(form.min_stock),
      status: form.status,
    });
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm overflow-y-auto p-4 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-orange-600 text-white px-5 py-4 md:px-8 md:py-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-3xl font-bold">
              {product ? "Edit Product" : "Add Product"}
            </h2>

            <p className="text-orange-100 text-sm md:text-base">
              Manage your store inventory
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="hover:bg-orange-700 rounded-lg p-2 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-5 md:p-8 space-y-6"
        >
          {/* Product & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="mb-2 font-medium flex items-center gap-2">
                <Package size={18} />
                Product Name
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder=""
                required
                className="w-full rounded-xl border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 font-medium flex items-center gap-2">
                <Tag size={18} />
                Category
              </label>

              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                required
                className="w-full rounded-xl border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select Category</option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="mb-2 font-medium flex items-center gap-2">
                <DollarSign size={18} />
                Cost Price
              </label>

              <input
                type="number"
                step="0.01"
                name="cost_price"
                value={form.cost_price}
                onChange={handleChange}
                className="w-full rounded-xl border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 font-medium flex items-center gap-2">
                <DollarSign size={18} />
                Selling Price
              </label>

              <input
                type="number"
                step="0.01"
                name="selling_price"
                value={form.selling_price}
                onChange={handleChange}
                className="w-full rounded-xl border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Stock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block mb-2 font-medium flex items-center gap-2">
                <Boxes size={18} />
                Stock
              </label>

              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className="w-full rounded-xl border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium flex items-center gap-2">
                Minimum Stock
              </label>

              <input
                type="number"
                name="min_stock"
                value={form.min_stock}
                onChange={handleChange}
                className="w-full rounded-xl border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium flex items-center gap-2">
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-xl border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Profit Card */}
          <div className="rounded-xl border border-green-200 bg-green-50 p-5">
            <p className="text-gray-500 text-sm">
              Estimated Profit per Item
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-green-600">
              ₱{profit}
            </h2>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse md:flex-row justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full md:w-auto px-6 py-3 rounded-xl border hover:bg-gray-100 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl transition"
            >
              {product ? "Update Product" : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}