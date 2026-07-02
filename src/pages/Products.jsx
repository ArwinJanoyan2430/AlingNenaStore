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
        total + Number(product.cost_price ?? 0) * Number(product.stock ?? 0)
      );
    }, 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter(
      (product) => Number(product.stock) <= Number(product.min_stock || 5),
    ).length;
  }, [products]);

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
    if (!productToDelete) return;

    try {
      await deleteProduct(productToDelete);

      setProducts((prev) =>
        prev.filter((product) => product.id !== productToDelete),
      );

      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (error) {
      console.error(error);
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

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
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

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {lowStockCount}
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="text-red-600" size={30} />
                </div>
              </div>

              <h2 className="mt-4 text-2xl font-bold text-center text-gray-900">
                Delete Product?
              </h2>

              <p className="mt-2 text-center text-gray-500">
                Are you sure you want to delete this product?
              </p>

              <p className="mt-1 text-center text-sm text-red-500">
                This action cannot be undone.
              </p>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setProductToDelete(null);
                  }}
                  className="flex-1 rounded-xl border border-gray-300 py-3 font-medium hover:bg-gray-100 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDelete}
                  className="flex-1 rounded-xl bg-red-600 py-3 font-medium text-white hover:bg-red-700 transition"
                >
                  Delete
                </button>
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

          {(() => {
            const lowStockProducts = products
              .filter((product) => {
                const stockPacks =
                  Number(product.stock) / Number(product.pack_size || 1);

                return stockPacks <= Number(product.min_stock || 5);
              })
              .sort((a, b) => Number(a.stock) - Number(b.stock));

            if (lowStockProducts.length === 0) {
              return (
                <p className="p-5 text-sm text-gray-500 text-center">
                  No low stock products.
                </p>
              );
            }

            return (
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
                        {fullPacks > 0
                          ? `${fullPacks} pack${fullPacks > 1 ? "s" : ""}`
                          : `${remainingPieces} pc${remainingPieces !== 1 ? "s" : ""}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
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
