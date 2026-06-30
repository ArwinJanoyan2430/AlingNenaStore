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
    (p.name || "").toLowerCase().includes(search.toLowerCase())
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
          item.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
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
          : item
      )
    );
  };

  const decreaseQty = (id) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, qty: item.qty - 1 }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // ---------------- TOTAL ----------------
  const total = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum + (Number(item.selling_price) || 0) * (item.qty || 0),
      0
    );
  }, [cart]);

  const change = Math.max(Number(cash || 0) - total, 0);

  // ---------------- CHECKOUT ----------------
// ---------------- CHECKOUT ----------------
const checkout = async () => {
  if (cart.length === 0) {
    toast.error("Cart is empty.");
    return;
  }

  if (Number(cash) < total) {
    toast.error("Insufficient cash.");
    return;
  }

  const changeAmount = Number(cash) - total;

  try {
    // Save Sale
    const { error: saleError } = await supabase
      .from("sales")
      .insert([
        {
          subtotal: total,
          total: total,
          payment: Number(cash),
          change: changeAmount,
          created_at: new Date().toISOString(),
        },
      ]);

    if (saleError) {
      console.error(saleError);
      toast.error(saleError.message);
      return;
    }

    // Update Product Stocks
    for (const item of cart) {
      const newStock = item.stock - item.qty;

      const { error: stockError } = await supabase
        .from("products")
        .update({
          stock: newStock,
        })
        .eq("id", item.id);

      if (stockError) {
        console.error(stockError);
        toast.error(`Failed to update stock for ${item.name}`);
        return;
      }
    }

    // Reload products
    await fetchProducts();

    toast.success("Sale completed!");

    setCart([]);
    setCash("");
  } catch (err) {
    console.error(err);
    toast.error("Failed to complete sale.");
  }
};


  // ---------------- LOADING UI ----------------
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen p-6">

      {/* HEADER */}
      <div className="mb-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-lg px-6 py-5 text-white">
          <h1 className="text-3xl font-bold">
              Cashier
          </h1>

          <p className="">
              Point of Sale System
          </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

<div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-5">

  {/* SEARCH */}
  <div className="relative mb-5">
    <Search className="absolute left-3 top-3 text-slate-400" size={18} />
    <input
      className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
      placeholder="Search products..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  </div>

  {/* FIXED GRID HEIGHT */}
  <div className="h-[420px] overflow-y-auto pr-2">

    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

      {filteredProducts.map((product) => (
        <button
          key={product.id}
          onClick={() => addToCart(product)}
          className="bg-white border border-gray-900 rounded-2xl p-4 text-left hover:border-orange-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
        >
          <h2 className="font-semibold text-gray-800 line-clamp-2">{product.name}</h2>

          <p className="text-xl font-bold text-orange-600 mt-2">
            ₱{product.selling_price}
          </p>

          <div className="mt-0 flex justify-between items-center">
            <span className="text-xs text-gray-500">
              Stock:
            </span>
            <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
              {product.stock}
            </span>
          </div>
        </button>
      ))}

    </div>
  </div>
</div>
{/* CART */}
<div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 flex flex-col h-[80vh]">

  <h2 className="text-xl font-bold mb-4">Cart</h2>

  {/* SCROLL AREA */}
  <div className="flex-1 overflow-y-auto space-y-3 pr-2">

    {cart.length === 0 && (
      <p className="text-slate-400">No items</p>
    )}

    {cart.map((item) => (
      <div key={item.id} className="bg-gray-50 border border-gray-900 rounded-xl p-3 hover:bg-white transition">
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

        <span className="text-black">
        Total
        </span>

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

        <span className="text-gray-900">
        Change
        </span>

        <span className="text-xl font-bold text-green-600">
        ₱{change.toLocaleString()}
        </span>

        </div>

            <button
              onClick={checkout}
              className="w-full mt-2 bg-orange-600 hover:bg-orange-700 active:scale-95 transition-all rounded-xl py-2 text-sm font-semibold text-white shadow-lg"
            >
              Complete Sale
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}