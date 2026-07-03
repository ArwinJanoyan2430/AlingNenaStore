import { useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import { Boxes, Wallet, AlertTriangle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";

import { getCategories } from "../services/categoryServices";
import ProductToolbar from "../components/ProductToolbar";
import ProductTable from "../components/ProductTable";
import ProductModal from "../components/ProductModal";

export default function Products() {
  const [deleting, setDeleting] = useState(false);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    loadData();
  }, []);
  const totalInventoryValue = useMemo(() => {
    return products.reduce((total, product) => {
      return (
        total + Number(product.stock || 0) * Number(product.cost_price || 0)
      );
    }, 0);
  }, [products]);

  const isLowStock = (product) => {
    const stock = Number(product.stock || 0);
    const minStock = Number(product.min_stock || 0);

    return stock <= minStock;
  };

  const lowStockProducts = products
    .filter(isLowStock)
    .sort((a, b) => Number(a.stock) - Number(b.stock));

  async function loadData() {
    try {
      setLoading(true);

      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(product) {
    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, product);
      } else {
        await addProduct(product);
      }

      await loadData();

      setShowModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  }

  async function handleDelete() {
    if (!productToDelete || deleting) return;

    try {
      setDeleting(true);

      await deleteProduct(productToDelete);

      setProducts((prev) =>
        prev.filter((product) => product.id !== productToDelete),
      );

      toast.success("Product deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete product");
    } finally {
      setDeleting(false);
    }
  }

  function handleAdd() {
    setSelectedProduct(null);
    setShowModal(true);
  }

  function handleEdit(product) {
    setShowModal(false); // FORCE reset first
    setSelectedProduct(null);

    setTimeout(() => {
      setSelectedProduct(product);
      setShowModal(true);
    }, 0);
  }

  function resetDeleteState() {
    setShowDeleteModal(false);
    setShowFinalConfirm(false);
    setProductToDelete(null);
    setDeleting(false);
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = (product.name ?? "")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        category === "" || product.category_id === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6 bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold">Products</h1>

        <p className="text-white">Product management and inventory overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Inventory Value */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-green-100 opacity-40 blur-2xl group-hover:scale-125 transition-all" />

          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                Inventory Value
              </p>

              <h2 className="mt-2 text-3xl font-bold text-green-500">
                ₱{totalInventoryValue.toLocaleString()}
              </h2>

              <p className="mt-2 text-xs text-gray-400">
                Cost Price × Current Stock
              </p>
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 shadow-lg transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
              <Wallet size={30} className="text-white" />
            </div>
          </div>

          <div className="mt-6 h-1 w-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-700 transition-all duration-300 group-hover:w-full" />
        </div>

        {/* Total Products */}
        <Card title="Total Products" value={products.length} icon={Boxes} />

        {/* Low Stock */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-red-100 opacity-40 blur-2xl group-hover:scale-125 transition-all" />

          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                Low Stock
              </p>

              <h2 className="mt-2 text-3xl font-bold text-red-500">
                {lowStockProducts.length}
              </h2>
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 shadow-lg transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
              <AlertTriangle size={30} className="text-white" />
            </div>
          </div>

          <div className="mt-6 h-1 w-16 rounded-full bg-gradient-to-r from-red-500 to-rose-700 transition-all duration-300 group-hover:w-full" />
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div
              className="w-[92%] max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top danger bar */}
              <div className="h-2 bg-red-500" />

              <div className="p-6">
                {/* STEP 1 */}
                {!showFinalConfirm ? (
                  <>
                    <h2 className="mt-0 text-center text-xl font-bold text-gray-900">
                      Delete Product?
                    </h2>

                    <p className="mt-2 text-center text-gray-500 text-sm">
                      This action will permanently remove this product.
                    </p>

                    <div className="mt-5 rounded-xl bg-red-50 border border-red-100 p-3 text-center">
                      <p className="text-xs text-red-600 font-medium">
                        ⚠ This cannot be undone
                      </p>
                    </div>

                    <div className="mt-6 flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={resetDeleteState}
                        className="flex-1 rounded-xl border border-gray-300 py-3 font-medium text-gray-700 hover:bg-gray-100 transition"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={() => setShowFinalConfirm(true)}
                        className="flex-1 rounded-xl bg-red-100 text-red-700 py-3 font-medium hover:bg-red-200 transition"
                      >
                        Continue
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* STEP 2 */}
                    <h2 className="mt-5 text-center text-xl font-bold text-red-600">
                      Final Confirmation
                    </h2>

                    <p className="mt-2 text-center text-gray-600 text-sm">
                      Are you sure you want to delete this product?
                    </p>

                    <div className="mt-5 rounded-xl bg-red-50 border border-red-200 p-3 text-center">
                      <p className="text-xs text-red-600 font-semibold">
                        This action is irreversible
                      </p>
                    </div>

                    <div className="mt-6 flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setShowFinalConfirm(false)}
                        className="flex-1 rounded-xl border border-gray-300 py-3 font-medium text-gray-700 hover:bg-gray-100 transition"
                      >
                        Back
                      </button>

                      <button
                        onClick={async () => {
                          await handleDelete();
                          resetDeleteState();
                        }}
                        disabled={deleting}
                        className="flex-1 rounded-xl bg-red-600 py-3 font-medium text-white hover:bg-red-700 transition disabled:opacity-50"
                      >
                        {deleting ? "Deleting..." : "Yes, Delete"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <ProductToolbar
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        categories={categories}
        onAddProduct={handleAdd}
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Products Table */}
        <div className="xl:col-span-3">
          <ProductTable
            products={filteredProducts}
            onEdit={handleEdit}
            onDelete={(id) => {
              setProductToDelete(id);
              setShowDeleteModal(true);
            }}
          />
        </div>

        {/* Low Stock List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Low Stock Items
              </h2>
              <p className="text-sm text-gray-500">Restock these soon</p>
            </div>

            <AlertTriangle size={20} className="text-red-500" />
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="p-5 text-sm text-gray-500 text-center">
              No low stock products.
            </p>
          ) : (
            <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-100">
              {lowStockProducts.map((product) => {
                const packSize = Number(product.pack_size || 1);
                const stock = Number(product.stock);

                const fullPacks = Math.floor(stock / packSize);
                const remainingPieces = stock % packSize;

                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {product.name}
                      </p>

                      <p className="text-xs text-gray-500">
                        Min Stock: {product.min_stock || 5}
                      </p>
                    </div>

                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                      {stock} left
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ProductModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        product={selectedProduct}
        categories={categories}
      />
    </div>
  );
}
