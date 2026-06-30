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
      // SAVE SALE
const { data, error } = await supabase.from("sales").insert([
  {
    subtotal: total,
    total: total,
    payment: Number(cash),
    change: changeAmount,
    created_at: new Date().toISOString(),
  },
]);

if (error) {
  console.log("SUPABASE ERROR:", error);
  toast.error(error.message);
  return;
}

      // UPDATE STOCK (UI ONLY FOR NOW)
      setProducts((prev) =>
        prev.map((product) => {
          const cartItem = cart.find((i) => i.id === product.id);

          if (cartItem) {
            return {
              ...product,
              stock: Math.max(product.stock - cartItem.qty, 0),
            };
          }

          return product;
        })
      );

      toast.success("Sale completed!");

      setCart([]);
      setCash("");

    } catch (err) {
      console.error(err);
      toast.error("Failed to save sale");
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
      <div className="mb-6 bg-white rounded-xl shadow p-5">
        <h1 className="text-3xl font-bold">Cashier</h1>
        <p className="text-slate-600">POS System</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

<div className="lg:col-span-2 bg-white rounded-xl shadow p-5">

  {/* SEARCH */}
  <div className="relative mb-5">
    <Search className="absolute left-3 top-3 text-slate-400" size={18} />
    <input
      className="w-full border rounded-lg pl-10 pr-4 py-2"
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
          className="border rounded-xl p-4 hover:shadow transition"
        >
          <h2 className="font-semibold">{product.name}</h2>

          <p className="text-amber-700 font-bold">
            ₱{product.selling_price}
          </p>

          <p className="text-xs text-slate-500">
            Stock: {product.stock}
          </p>
        </button>
      ))}

    </div>
  </div>
</div>
{/* CART */}
<div className="bg-white rounded-xl shadow p-5 flex flex-col h-[80vh]">

  <h2 className="text-xl font-bold mb-4">Cart</h2>

  {/* SCROLL AREA */}
  <div className="flex-1 overflow-y-auto space-y-3 pr-2">

    {cart.length === 0 && (
      <p className="text-slate-400">No items</p>
    )}

    {cart.map((item) => (
      <div key={item.id} className="border rounded-lg p-3">
        <div className="flex justify-between">
          <div>
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-sm">₱{item.selling_price}</p>
          </div>

          <button
            onClick={() => removeItem(item.id)}
            className="text-red-500"
          >
            <Trash2 size={18} />
          </button>
        </div>

        <div className="flex justify-between mt-3">
          <div className="flex items-center gap-2">
            <button onClick={() => decreaseQty(item.id)}>
              <Minus />
            </button>

            <span>{item.qty}</span>

            <button onClick={() => increaseQty(item.id)}>
              <Plus />
            </button>
          </div>

          <span className="font-bold">
            ₱{item.qty * item.selling_price}
          </span>
        </div>
      </div>
    ))}
  </div>

          {/* TOTAL */}
          <div className="border-t mt-5 pt-5">

            <div className="flex justify-between">
              <span>Total</span>
              <span className="font-bold">₱{total}</span>
            </div>

            <input
              type="number"
              placeholder="Cash"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              className="w-full border rounded-lg p-3 mt-3"
            />

            <div className="flex justify-between mt-3">
              <span>Change</span>
              <span className="font-bold text-green-600">
                ₱{change}
              </span>
            </div>

            <button
              onClick={checkout}
              className="w-full mt-4 py-3 text-white bg-gradient-to-r from-amber-700 to-orange-900 rounded-lg"
            >
              Complete Sale
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}