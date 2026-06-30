import { useEffect, useMemo, useState } from "react";

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
                    {filteredProducts.length} Product(s)
                </p>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

  {/* Total Inventory Value */}
  <div className="bg-white rounded-xl shadow border p-5">
    <p className="text-sm text-gray-500">
      Total Inventory Value
    </p>

    <h2 className="text-3xl font-bold text-green-600 mt-2">
      ₱{totalInventoryValue.toLocaleString()}
    </h2>

    <p className="text-xs text-gray-400 mt-1">
      Based on cost price × current stock
    </p>
  </div>

  {/* Low Stock */}
  <div className="bg-white rounded-xl shadow border p-5">
<div className="flex items-center justify-between">
  <p className="text-sm font-medium text-gray-500">
    Low Stock Products
  </p>

<p
  onClick={() => navigate("/app/dashboard")}
  className="cursor-pointer text-xs font-medium text-orange-600 hover:text-orange-700"
>
  View Low Stock →
</p>
</div>
    
    <h2 className="text-3xl font-bold text-red-600 mt-2">
      {lowStockCount}
    </h2>

    <p className="text-xs text-gray-400 mt-1">
      Products below minimum stock
    </p>
    
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