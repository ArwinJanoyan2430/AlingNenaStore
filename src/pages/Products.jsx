import { useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import {
  Boxes,
  Wallet,
  AlertTriangle,
  ArrowRight
} from "lucide-react";

import {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct
} from "../services/productService";

import { getCategories } from "../services/categoryServices";
import { useNavigate } from "react-router-dom";
import ProductToolbar from "../components/ProductToolbar";
import ProductTable from "../components/ProductTable";
import ProductModal from "../components/ProductModal";

export default function Products() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

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
      total +
      Number(product.cost_price || 0) * Number(product.stock || 0)
    );
  }, 0);
}, [products]);

const lowStockCount = useMemo(() => {
  return products.filter(
    (product) =>
      Number(product.stock) <= Number(product.min_stock || 5)
  ).length;
}, [products]);

    async function loadData() {

        try {

            setLoading(true);

            const [productsData, categoriesData] = await Promise.all([
                getProducts(),
                getCategories()
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
            alert(error.message);

        }

    }

async function fetchCategories() {
    console.log("Fetching categories...");

    try {
        const data = await getCategories();

        console.log("Fetched categories:", data);

        setCategories(data);
    } catch (error) {
        console.error("Category Error:", error);
    }
}

    async function handleDelete(id) {

        if (!window.confirm("Delete this product?")) return;

        try {

            await deleteProduct(id);

            setProducts(prev =>
                prev.filter(product => product.id !== id)
            );

        } catch (error) {

            console.error(error);

        }

    }

    function handleAdd() {

        setSelectedProduct(null);
        setShowModal(true);

    }

    function handleEdit(product) {

        setSelectedProduct(product);
        setShowModal(true);

    }

    const filteredProducts = useMemo(() => {

        return products.filter(product => {

            const matchesSearch =
                product.name
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const matchesCategory =
                category === "" ||
                product.category_id === category;

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

                <h1 className="text-3xl font-bold">
                    Products
                </h1>

                <p className="text-white">
                    Product management and inventory overview
                </p>

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
  <Card
    title="Total Products"
    value={products.length}
    icon={Boxes}
  />

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

        <button
          onClick={() => navigate("/app/dashboard")}
          className="mt-2 flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
        >
          View Items
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 shadow-lg transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
        <AlertTriangle size={30} className="text-white" />
      </div>

    </div>

    <div className="mt-6 h-1 w-16 rounded-full bg-gradient-to-r from-red-500 to-rose-700 transition-all duration-300 group-hover:w-full" />

  </div>

</div>

            <ProductToolbar
                search={search}
                setSearch={setSearch}
                category={category}
                setCategory={setCategory}
                categories={categories}
                onAddProduct={handleAdd}
            />

            <ProductTable
                products={filteredProducts}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

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