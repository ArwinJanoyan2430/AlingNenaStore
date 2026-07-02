import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Minus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "../services/supabase";

export default function Pos() {
  const [search, setSearch] = useState("");
  const [cash, setCash] = useState("");
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState(null);

  // ---------------- LOAD PRODUCTS ----------------
  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name");

    if (error) {
      console.error(error);
      toast.error("Failed to load products");
      setProducts([]);
    } else {
      setProducts(data || []);
    }

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
      // Insert sale and get its ID
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert([
          {
            subtotal: lastSale.total,
            total: lastSale.total,
            payment: lastSale.cash,
            change: lastSale.change,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (saleError) {
        toast.error(saleError.message);
        return;
      }

      // Insert every item into sale_items
      const saleItems = lastSale.items.map((item) => ({
        sale_id: sale.id,
        product_id: item.id,
        quantity: item.qty,
        selling_price: item.selling_price,
        cost_price: item.cost_price,
        created_at: new Date().toISOString(),
      }));

      const { error: itemError } = await supabase
        .from("sale_items")
        .insert(saleItems);

      if (itemError) {
        toast.error(itemError.message);
        return;
      }

      // Update stock
      for (const item of lastSale.items) {
        const { error } = await supabase
          .from("products")
          .update({
            stock: item.stock - item.qty,
          })
          .eq("id", item.id);

        if (error) {
          toast.error(`Failed to update stock for ${item.name}`);
          return;
        }
      }

      await fetchProducts();

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

          {/* FIXED GRID HEIGHT */}
          <div className="h-[60vh] md:h-170 overflow-y-auto pr-2">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-500 hover:shadow-xl"
                >
                  <div className="flex justify-between items-start">
                    <h2 className="font-semibold text-gray-800 line-clamp-2">
                      {product.name}
                    </h2>

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

                  <p className="mt-4 text-2xl font-bold text-orange-600">
                    ₱{Number(product.selling_price).toLocaleString()}
                  </p>

                  <button className="mt-5 w-full rounded-xl bg-orange-100 py-2 text-sm font-semibold text-orange-600 transition group-hover:bg-orange-600 group-hover:text-white">
                    Add to Cart
                  </button>
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* CART */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 flex flex-col h-[80vh]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold">Shopping Cart</h2>

              <p className="text-sm text-gray-500">{cart.length} item(s)</p>
            </div>
          </div>

          {/* SCROLL AREA */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {cart.length === 0 && <p className="text-slate-400">No items</p>}

            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-gray-50  border border-gray-400 rounded-xl p-3 hover:bg-white transition"
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm">₱{item.selling_price}</p>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="h-8 w-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => decreaseQty(item.id)}
                      className="w-5 h-5 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 flex items-center justify-center transition"
                    >
                      <Minus />
                    </button>

                    <span>{item.qty}</span>

                    <button
                      onClick={() => increaseQty(item.id)}
                      className="w-5 h-5 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 flex items-center justify-center transition"
                    >
                      <Plus />
                    </button>
                  </div>

                  <span className="font-semibold text-lg w-6 text-center">
                    {item.qty}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* TOTAL */}
          <div className="mt-5 border-t pt-5">
            <div className="flex justify-between items-center">
              <span className="text-black">Total</span>

              <span className="text-xl font-bold text-orange-600">
                ₱{total.toLocaleString()}
              </span>
            </div>

            <input
              type="number"
              placeholder="Cash"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              className="w-full rounded-xl border border-gray-900 bg-gray-50 px-3 py-2 mt-2 text-smfocus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
            />

            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-900">Change</span>

              <span className="text-xl font-bold text-green-600">
                ₱{change.toLocaleString()}
              </span>
            </div>

            <button
              onClick={checkout}
              className="w-full mt-2 bg-orange-600 hover:bg-orange-700 active:scale-95 transition-all rounded-xl py-4 text-sm font-semibold text-white shadow-lg"
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
