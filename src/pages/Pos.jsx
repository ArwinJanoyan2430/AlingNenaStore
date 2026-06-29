import { useMemo, useState } from "react";
import { Search, Plus, Minus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from '../services/supabase';
import sampleProducts from "../sampleData/products";

export default function Pos() {
  const [search, setSearch] = useState("");
  const [cash, setCash] = useState("");
  const [cart, setCart] = useState([]);

  const filteredProducts = sampleProducts.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);

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

  const increaseQty = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const decreaseQty = (id) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cart]);

  const change = Number(cash || 0) - total;

  const checkout = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty.");
      return;
    }

    if (Number(cash) < total) {
      toast.error("Insufficient cash.");
      return;
    }

    toast.success("Sale Completed!");

    setCart([]);
    setCash("");
  };

  return (
    <div className="min-h-screen p-6">

      <div className="mb-6 bg-white rounded-xl shadow p-5">
        <h1 className="text-3xl font-bold">Cashier</h1>
        <p className="text-slate-600">
          Sample cashier interface
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Products */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-5">
          <div className="relative mb-5">
            <Search
              className="absolute left-3 top-3 text-slate-400"
              size={18}
            />
            <input
              className="w-full border rounded-lg pl-10 pr-4 py-2"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="border rounded-xl p-4 hover:border-amber-700 hover:shadow transition text-left"
              >
                <div className="rounded-lg mb-0"></div>
                <h2 className="font-semibold">
                  {product.name}
                </h2>
                <p className="text-amber-700 font-bold">
                  ₱{product.price}
                </p>
                <p className="text-xs text-slate-500">
                  Stock: {product.stock}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="bg-white rounded-xl shadow p-5 flex flex-col">
          <h2 className="text-xl font-bold mb-4">
            Current Order
          </h2>
          <div className="flex-1 space-y-3 overflow-auto">
            {cart.length === 0 && (
              <p className="text-slate-400">
                No items yet.
              </p>
            )}
            {cart.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-3"
              >

                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {item.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      ₱{item.price}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500"
                  >
                    <Trash2 size={18}/>
                  </button>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => decreaseQty(item.id)}
                      className="p-1 rounded bg-slate-200"
                    >
                      <Minus size={16}/>
                    </button>
                    <span>{item.qty}</span>
                    <button
                      onClick={() => increaseQty(item.id)}
                      className="p-1 rounded bg-slate-200"
                    >
                      <Plus size={16}/>
                    </button>
                  </div>
                  <span className="font-bold">
                    ₱{item.qty * item.price}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t mt-5 pt-5">
            <div className="flex justify-between mb-2">
              <span>Total</span>
              <span className="font-bold">
                ₱{total}
              </span>
            </div>

            <input
              type="number"
              placeholder="Cash"
              value={cash}
              onChange={(e)=>setCash(e.target.value)}
              className="w-full border rounded-lg p-3 mb-3"
            />

            <div className="flex justify-between mb-5">
              <span>Change</span>
              <span className="font-bold text-green-600">
                ₱{change > 0 ? change : 0}
              </span>
            </div>
            <button
              onClick={checkout}
              className="w-full py-3 rounded-lg text-white bg-gradient-to-r from-amber-700 to-orange-900"
            >
              Complete Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}