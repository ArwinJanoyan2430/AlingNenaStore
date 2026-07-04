import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Minus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { sampleProducts } from "../data/sampleProducts";
import { sampleSales } from "../data/sampleSales";
import { sampleSaleItems } from "../data/sampleSaleItems";

export default function Pos() {
  const [search, setSearch] = useState("");
  const [cash, setCash] = useState("");
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const [todayProfit, setTodayProfit] = useState(0);
  const [sales, setSales] = useState(sampleSales);
  const [saleItems, setSaleItems] = useState(sampleSaleItems);

  // ---------------- LOAD PRODUCTS ----------------
  const computeProfit = (items) => {
    return items.reduce((sum, item) => {
      const cost = Number(item.cost_price || 0);
      const sell = Number(item.selling_price || 0);
      return sum + item.qty * (sell - cost);
    }, 0);
  };
  useEffect(() => {
    fetchProducts();
  }, []);

  function fetchProducts() {
    setLoading(true);

    const sorted = [...sampleProducts].sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    setProducts(sorted);

    setLoading(false);
  }

  // ---------------- FILTER ----------------
  const filteredProducts = useMemo(() => {
    return (products || []).filter((p) =>
      (p.name || "").toLowerCase().includes(search.toLowerCase()),
    );
  }, [products, search]);

  // ---------------- ADD TO CART ----------------
  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);

    if (!product.stock || product.stock <= 0) {
      toast.error("Out of stock");
      return;
    }

    if (existing && existing.qty >= product.stock) {
      toast.error("Not enough stock");
      return;
    }

    setCart((prev) => {
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }

      return [...prev, { ...product, qty: 1 }];
    });
  };

  // ---------------- QTY CONTROL ----------------
  const increaseQty = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.qty < item.stock
          ? { ...item, qty: item.qty + 1 }
          : item,
      ),
    );
  };

  const decreaseQty = (id) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty - 1 } : item))
        .filter((item) => item.qty > 0),
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // ---------------- TOTAL ----------------
  const total = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + (Number(item.selling_price) || 0) * (item.qty || 0),
      0,
    );
  }, [cart]);

  const change = Math.max(Number(cash || 0) - total, 0);

  // ---------------- CHECKOUT ----------------
  // ---------------- CHECKOUT ----------------
  const checkout = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty.");
      return;
    }

    if (Number(cash) < total) {
      toast.error("Insufficient cash.");
      return;
    }

    setLastSale({
      items: [...cart],
      total,
      cash: Number(cash),
      change: Number(cash) - total,
      date: new Date(),
    });

    setShowReceipt(true);
  };

  // ---------------- LOADING UI ----------------
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  async function nextSale() {
    try {
      const saleId = Date.now();

      const newSale = {
        id: saleId,
        subtotal: lastSale.total,
        total: lastSale.total,
        payment: lastSale.cash,
        change: lastSale.change,
        created_at: new Date().toISOString(),
      };

      const newSaleItems = lastSale.items.map((item) => ({
        sale_id: saleId,
        product_id: item.id,
        quantity: item.qty,
        selling_price: item.selling_price,
        cost_price: item.cost_price || 0,
      }));

      // ✅ FIXED STATE UPDATES
      setSales((prev) => [...prev, newSale]);
      setSaleItems((prev) => [...prev, ...newSaleItems]);

      // profit update
      const profit = computeProfit(lastSale.items);
      setTodayProfit((prev) => prev + profit);

      // stock update
      setProducts((prev) =>
        prev.map((p) => {
          const cartItem = lastSale.items.find((i) => i.id === p.id);
          if (!cartItem) return p;

          return {
            ...p,
            stock: p.stock - cartItem.qty,
          };
        }),
      );

      setCart([]);
      setCash("");
      setLastSale(null);
      setShowReceipt(false);

      toast.success("Sale completed!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to complete sale.");
    }
  }

  function backToPOS() {
    setShowReceipt(false);
  }

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen p-6">
      {/* HEADER */}
      <div className="mb-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-lg px-6 py-5 text-white">
        <h1 className="text-3xl font-bold">Cashier</h1>

        <p className="">Point of Sale System</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-5">
          {/* SEARCH */}
          <div className="relative mb-5">
            <Search
              className="absolute left-3 top-3 text-slate-400"
              size={18}
            />
            <input
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Product Grid */}
          <div className="h-[60vh] md:h-[42rem] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:border-orange-500 hover:shadow-md active:scale-95"
                >
                  {/* Product Name */}
                  <h2 className="min-h-[3rem] text-sm font-semibold leading-snug text-gray-800 break-words">
                    {product.name}
                  </h2>

                  {/* Price */}
                  <p className="mt-0 text-2xl font-bold text-orange-600">
                    ₱{Number(product.selling_price).toLocaleString()}
                  </p>

                  {/* Stock */}
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Stock</span>

                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        product.stock <= 5
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* CART */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Shopping Cart</h2>
              <p className="text-sm text-gray-500">{cart.length} item(s)</p>
            </div>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="flex h-full items-center justify-center text-gray-400">
                No items added
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-4 hover:bg-white hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        {item.name}
                      </h3>

                      <p className="text-sm text-gray-500">
                        ₱{item.selling_price.toFixed(2)}
                      </p>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center rounded-lg border border-gray-300 overflow-hidden">
                      <button
                        onClick={() => decreaseQty(item.id)}
                        className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 transition"
                      >
                        <Minus size={12} />
                      </button>

                      <span className="w-12 text-center text-sm font-semibold">
                        {item.qty}
                      </span>

                      <button
                        onClick={() => increaseQty(item.id)}
                        className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 transition"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <span className="font-bold text-orange-600">
                      ₱{(item.qty * item.selling_price).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          <div className="border-t bg-gray-50 p-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Total</span>
              <span className="text-2xl font-bold text-orange-600">
                ₱{total.toLocaleString()}
              </span>
            </div>

            <input
              type="number"
              placeholder="Enter cash"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
            />

            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Change</span>
              <span className="text-xl font-bold text-green-600">
                ₱{change.toLocaleString()}
              </span>
            </div>

            <button
              onClick={checkout}
              className="w-full rounded-xl bg-orange-600 py-3 text-white font-semibold hover:bg-orange-700 active:scale-95 transition-all shadow-md"
            >
              Complete Sale
            </button>
          </div>
        </div>
      </div>
      {showReceipt && lastSale && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white p-5 rounded-t-3xl sm:rounded-t-2xl">
              <h2 className="text-2xl font-bold">Confirm Transaction</h2>

              <p className="text-orange-100 text-sm">Transaction Summary</p>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              <div className="p-0 space-y-2">
                {lastSale.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between text-sm"
                  >
                    {/* Left side */}
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium truncate">{item.name}</span>

                      <span className="text-[11px] text-gray-500">
                        {item.qty} × ₱
                        {Number(item.selling_price).toLocaleString()}
                      </span>
                    </div>

                    {/* Right side */}
                    <span className="font-semibold whitespace-nowrap">
                      ₱{(item.qty * item.selling_price).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="border-t p-5 space-y-3">
              <div className="flex justify-between">
                <span>Total</span>
                <span className="font-bold">
                  ₱{lastSale.total.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Cash</span>
                <span>₱{lastSale.cash.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span>Change</span>
                <span className="font-bold text-green-600">
                  ₱{lastSale.change.toLocaleString()}
                </span>
              </div>

              {/* 🔥 PROFIT SECTION */}
              <div className="flex justify-between">
                <span>Profit</span>
                <span className="font-bold text-green-600">
                  + ₱
                  {lastSale.items
                    .reduce(
                      (sum, item) =>
                        sum +
                        item.qty * (item.selling_price - item.cost_price || 0),
                      0,
                    )
                    .toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <span>Date</span>
                <span>{lastSale.date.toLocaleString()}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="border-t p-5 flex flex-col sm:flex-row gap-3">
              <button
                onClick={backToPOS}
                className="w-full sm:flex-1 py-3 rounded-xl border border-gray-300 font-medium hover:bg-gray-100 transition"
              >
                Back
              </button>

              <button
                onClick={nextSale}
                className="w-full sm:flex-1 py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
