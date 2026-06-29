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
} from "lucide-react";

const Sidebar = () => {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
    { name: "POS", href: "/pos", icon: ShoppingCart },
    { name: "Products", href: "/products", icon: Package },
    { name: "Sales", href: "/sales", icon: FileText },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full text-gray-100">
      
      {/* Header */}
      <div className="p-6 border-b border-white/10 ">
        <h1 className="text-lg font-bold tracking-wide sm:text-base">
          Omboy Store
        </h1>
        <p className="text-xs text-gray-400 mt-1 sm:text-base">POS System</p>
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
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition text-sm sm:text-base"
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