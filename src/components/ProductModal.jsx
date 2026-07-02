import { useEffect, useState, useMemo } from "react";
import {
  Package,
  Layers,
  X,
  TrendingUp,
  Boxes,
  Calculator,
} from "lucide-react";

import toast from "react-hot-toast";

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

const emptyForm = {
  name: "",
  category_id: "",
  cost_per_pack: "",
  pack_size: "",
  cost_per_piece: "",
  sell_per_piece: "",
  stock_packs: "",
  stock_pieces: "",
  min_stock: "",
  status: "Active",
};

export default function ProductModal({
  show,
  onClose,
  onSave,
  product,
  categories = [],
}) {
  const [mode, setMode] = useState("pack");
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!show) return;

    if (product) {
      setForm({
        name: product.name ?? "",
        category_id: product.category_id ?? "",

        cost_per_pack: product.cost_price ?? "",
        cost_per_piece: product.cost_price ?? "",
        sell_per_piece: product.selling_price ?? "",

        pack_size: product.pack_size ?? 10,

        stock_packs: product.stock ?? "",
        stock_pieces: product.stock ?? "",

        min_stock: product.min_stock ?? 5,
        status: product.status ?? "Active",
      });

      setMode(product.mode === "piece" ? "piece" : "pack");
    } else {
      setForm(emptyForm);
      setMode("pack");
    }
  }, [show, product]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // ================= SAFE NUMBERS =================
  const packSize = Number(form.pack_size) || 1;
  const costPack = Number(form.cost_per_pack) || 0;
  const costPiece = Number(form.cost_per_piece) || 0;
  const sell = Number(form.sell_per_piece) || 0;

  // ================= CORE CALCULATIONS =================
  const costPerUnit = mode === "pack" ? costPack / packSize : costPiece;

  const totalStock =
    mode === "pack"
      ? (Number(form.stock_packs) || 0) * packSize
      : Number(form.stock_pieces) || 0;

  const profit = sell - costPerUnit;
  const profitMargin = sell > 0 ? ((profit / sell) * 100).toFixed(1) : 0;

  // ================= SUBMIT =================
  async function handleSubmit(e) {
    e.preventDefault();

    const packSize = Number(form.pack_size) || 1;

    const costPrice =
      mode === "pack"
        ? Number(form.cost_per_pack || 0) / packSize
        : Number(form.cost_per_piece || 0);

    const stock =
      mode === "pack"
        ? Number(form.stock_packs || 0) * packSize
        : Number(form.stock_pieces || 0);

    const payload = {
      name: form.name,
      category_id: form.category_id || null,
      cost_price: costPrice,
      selling_price: Number(form.sell_per_piece || 0),
      stock,
      min_stock: Number(form.min_stock || 0),
      status: form.status || "Active",
    };

    await onSave(payload);

    toast.success(product ? "Product updated!" : "Product added!");
    onClose();
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center">
      <div className="w-full md:max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2">
        <div className="col-span-2 flex items-center justify-between px-6 py-4 border-b bg-orange-600">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {product ? "Edit Product" : "Add Product"}
            </h2>
            <p className="text-sm text-white ">
              Manage product details and inventory
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        {/* LEFT FORM */}
        <div className="p-6 space-y-4">
          {/* MODE */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setMode("pack")}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${
                mode === "pack" ? "bg-orange-600 text-white" : ""
              }`}
            >
              <Layers size={16} /> Pack
            </button>

            <button
              type="button"
              onClick={() => setMode("piece")}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${
                mode === "piece" ? "bg-orange-600 text-white" : ""
              }`}
            >
              <Package size={16} /> Piece
            </button>
          </div>

          <Field label="Product Name">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </Field>

          <Field label="Category">
            <select
              required
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className="w-full border rounded-lg px-2 py-2"
            >
              <option value="">Select category</option>

              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </Field>

          {mode === "pack" ? (
            <>
              <Field label="Pieces per Pack">
                <input
                  name="pack_size"
                  value={form.pack_size}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </Field>

              <Field label="Cost per Pack">
                <input
                  name="cost_per_pack"
                  value={form.cost_per_pack}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </Field>
            </>
          ) : (
            <Field label="Cost per Piece">
              <input
                name="cost_per_piece"
                value={form.cost_per_piece}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </Field>
          )}

          <Field label="Selling Price">
            <input
              name="sell_per_piece"
              value={form.sell_per_piece}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </Field>

          <Field label={mode === "pack" ? "Stock (Packs)" : "Stock (Pieces)"}>
            <input
              name={mode === "pack" ? "stock_packs" : "stock_pieces"}
              value={mode === "pack" ? form.stock_packs : form.stock_pieces}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </Field>

          <Field label="Minimum Stock">
            <input
              name="min_stock"
              value={form.min_stock}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </Field>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              type="button"
              className="w-full bg-gray-100 py-2 rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full bg-orange-600 text-white py-2 rounded-lg"
            >
              Save
            </button>
          </div>
        </div>

        {/* RIGHT LIVE PREVIEW */}
        <div className="bg-gradient-to-br from-gray-50 to-white p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <TrendingUp size={18} /> Live Analytics
          </h3>

          {/* PROFIT */}
          <div className="bg-white border rounded-xl p-4">
            <p className="text-sm text-gray-500">Profit per unit</p>
            <p
              className={`text-3xl font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              ₱{profit.toFixed(2)}
            </p>
          </div>

          {/* MARGIN */}
          <div className="bg-white border rounded-xl p-4">
            <p className="text-sm text-gray-500">Profit Margin</p>
            <p className="text-2xl font-bold text-blue-600">{profitMargin}%</p>
          </div>

          {/* STOCK */}
          <div className="bg-white border rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Stock</p>
              <p className="text-2xl font-bold">{totalStock}</p>
            </div>
            <Boxes />
          </div>

          {/* COST INFO */}
          <div className="bg-white border rounded-xl p-4 text-sm text-gray-600">
            <p>
              Cost per unit: <b>₱{costPerUnit.toFixed(2)}</b>
            </p>
            <p>
              Selling price: <b>₱{sell.toFixed(2)}</b>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
