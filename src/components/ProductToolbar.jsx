export default function ProductToolbar({
  search,
  setSearch,
  category,
  setCategory,
  categories,
  onAddProduct,
}) {
  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200 p-4 mb-6">

      <div className="flex flex-col lg:flex-row gap-4">

        {/* Search */}
        <input
          type="text"
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />

        {/* Category */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full lg:w-56 rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="">All Categories</option>

          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Add Product */}
        <button
          onClick={onAddProduct}
          className="w-full lg:w-auto bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white font-semibold px-6 py-3 rounded-xl shadow transition active:scale-95"
        >
          + Add Product
        </button>

      </div>

    </div>
  );
}