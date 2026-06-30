import { useEffect, useMemo, useState } from "react";

import {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct
} from "../services/productService";

import { getCategories } from "../services/categoryServices";

import ProductToolbar from "../components/ProductToolbar";
import ProductTable from "../components/ProductTable";
import ProductModal from "../components/ProductModal";

export default function Products() {

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

    async function loadData() {

        try {

            setLoading(true);

            const [productsData, categoriesData] = await Promise.all([
                getProducts(),
                getCategories()
            ]);
console.log("Categories:", categoriesData);
console.log("Products:", productsData);
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

            <div>

                <h1 className="text-3xl font-bold">
                    Products
                </h1>

                <p className="text-gray-500">
                    {filteredProducts.length} Product(s)
                </p>

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