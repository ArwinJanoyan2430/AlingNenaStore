import { useEffect, useMemo, useState } from "react";
import {
    Package,
    DollarSign,
    Boxes,
    Tag,
    X
} from "lucide-react";

export default function ProductModal({
    show,
    onClose,
    onSave,
    product,
    categories
}) {

const [form, setForm] = useState({
    name: "",
    category_id: "",
    cost_price: "",
    selling_price: "",
    stock: "",
    min_stock: 5,
    status: "Active"
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
            status: product.status ?? "Active"
        });

    } else {

        setForm({
            name: "",
            category_id: "",
            cost_price: "",
            selling_price: "",
            stock: "",
            min_stock: 5,
            status: "Active"
        });

    }

}, [product]);

function handleChange(e) {

    const { name, value } = e.target;

    setForm(prev => ({
        ...prev,
        [name]: value
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
    stock: Number(form.stock)
});

}

    if(!show) return null;

    

    return(

        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">

            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">

                {/* Header */}

                <div className="bg-blue-600 text-white px-8 py-6 flex justify-between items-center">

                    <div>

                        <h2 className="text-3xl font-bold">

                            {product ? "Edit Product" : "Add Product"}

                        </h2>

                        <p className="text-blue-100">

                            Manage your store inventory

                        </p>

                    </div>

                    <button onClick={onClose}>

                        <X size={28}/>

                    </button>

                </div>

                <form
                    onSubmit={handleSubmit}
                    className="p-8 space-y-6"
                >

                    <div className="grid md:grid-cols-2 gap-6">

                        {/* Product */}

                        <div>

                            <label className="font-medium mb-2 flex items-center gap-2">

                                <Package size={18}/>

                                Product Name

                            </label>

                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full border rounded-xl px-4 py-3"
                                placeholder="Coca-Cola 500ml"
                                required
                            />

                        </div>

                        {/* Category */}

                        <div>

                            <label className="font-medium mb-2 flex items-center gap-2">

                                <Tag size={18}/>

                                Category

                            </label>

<select
    name="category_id"
    value={form.category_id}
    onChange={handleChange}
    className="w-full border rounded-xl px-4 py-3"
    required
>
    <option value="">Select Category</option>

    {categories.map(category => (
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

                    <div className="grid md:grid-cols-2 gap-6">

                        <div>

                            <label className="font-medium mb-2 flex items-center gap-2">

                                <DollarSign size={18}/>

                                Cost Price

                            </label>

                            <input
                                type="number"
                                step="0.01"
                                name="cost_price"
                                value={form.cost_price}
                                onChange={handleChange}
                                className="w-full border rounded-xl px-4 py-3"
                            />

                        </div>

                        <div>

                            <label className="font-medium mb-2 flex items-center gap-2">

                                <DollarSign size={18}/>

                                Selling Price

                            </label>

                            <input
                                type="number"
                                step="0.01"
                                name="selling_price"
                                value={form.selling_price}
                                onChange={handleChange}
                                className="w-full border rounded-xl px-4 py-3"
                            />

                        </div>

                    </div>

                    <div className="grid md:grid-cols-3 gap-6">

                        <div>

                            <label className="font-medium mb-2 flex items-center gap-2">

                                <Boxes size={18}/>

                                Stock

                            </label>

                            <input
                                type="number"
                                name="stock"
                                value={form.stock}
                                onChange={handleChange}
                                className="w-full border rounded-xl px-4 py-3"
                            />

                        </div>

                        <div>

                            <label className="font-medium mb-2">

                                Minimum Stock

                            </label>

                            <input
                                type="number"
                                name="min_stock"
                                value={form.min_stock}
                                onChange={handleChange}
                                className="w-full border rounded-xl px-4 py-3"
                            />

                        </div>

                        <div>

                            <label className="font-medium mb-2">

                                Status

                            </label>

                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className="w-full border rounded-xl px-4 py-3"
                            >

                                <option>Active</option>
                                <option>Inactive</option>

                            </select>

                        </div>

                    </div>

                    {/* Profit Card */}

                    <div className="bg-green-50 border border-green-200 rounded-xl p-5">

                        <p className="text-gray-500">
                            Estimated Profit per Item
                        </p>

                        <h2 className="text-3xl font-bold text-green-600">

                            ₱{profit}

                        </h2>

                    </div>

                    {/* Buttons */}

                    <div className="flex justify-end gap-4 pt-4">

                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl border hover:bg-gray-100"
                        >

                            Cancel

                        </button>

                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl"
                        >

                            {product ? "Update Product" : "Save Product"}

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}