export default function ProductToolbar({
    search,
    setSearch,
    category,
    setCategory,
    categories,
    onAddProduct
}) {
    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-3 flex-1">

                <input
                    type="text"
                    placeholder="Search product..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full outline-none focus:ring-2 focus:ring-blue-500"
                />

<select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    className="border border-gray-300 rounded-lg px-4 py-2"
>
    <option value="">All Categories</option>

    {categories.map(cat => (

        <option
            key={cat.id}
            value={cat.id}
        >
            {cat.name}
        </option>

    ))}

</select>

            </div>

            {/* Add Button */}
            <button
                onClick={onAddProduct}
                className="bg-gradient-to-r from-amber-700 to-orange-900 hover:bg-amber-700 text-white font-medium px-5 py-2 rounded-lg transition"
            >
                + Add Product
            </button>

        </div>
    );
}