import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  ShoppingCart,
  Package,
  FileText,
  LogOut,
  Menu,
  X,
  ShoppingBag, 
} from "lucide-react";

const Sidebar = () => {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/app/dashboard", icon: LayoutGrid },
    { name: "Cashier", href: "/app/pos", icon: ShoppingCart },
    { name: "Inventory", href: "/app/products", icon: Package },
    { name: "Sales Report", href: "/app/sales", icon: FileText },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full text-gray-100">
      
      {/* Header */}
      <div className="p-6 border-b border-white/10 ">
      <div className="flex items-center gap-3
          rounded-2xl
          bg-white/8
          backdrop-blur-xl
          border border-white/20
          shadow-[0_8px_32px_rgba(0,0,0,0.12)]
          px-4 py-3
          transition-all duration-300
          hover:bg-white/13
          hover:shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
        <ShoppingBag />
          <div>
            <p className="font-bold text-[16px] text-white tracking-wide">Omboy Store</p>
            <p className="text-[11px] text-slate-500 font-medium">POS System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                ${
                  active
                    ? "bg-gradient-to-r from-amber-700 to-orange-900 text-white shadow-md"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
            >
              <item.icon size={18} className={active ? "text-white" : "text-gray-400"} />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-white/10 shrink-0 bg-gray-950">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition text-sm"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-2 rounded-lg shadow"
      >
        <Menu size={20} />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 h-screen bg-gray-950 border-r border-white/10">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed lg:hidden top-0 left-0 h-full w-64 bg-gray-950 z-50 flex flex-col shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex justify-end p-3">
          <button
            onClick={() => setMobileOpen(false)}
            className="text-gray-300 hover:text-white"
          >
            <X />
          </button>
        </div>
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;