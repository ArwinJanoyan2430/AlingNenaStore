import Card from "../components/Card";
import { DollarSign, ShoppingCart, Package, AlertTriangle } from "lucide-react";

const Dashboard = () => {

  return (
    <div className="p-6 mt-5 md:mt-0">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6 bg-white rounded-xl shadow p-5">
        <h1 className="text-3xl font-bold text-slate-900">
          Omboy Store
        </h1>
        <p className="text-slate-600 mt-0">
          Sales and transactions overview
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
        <Card title="Revenue" value={`₱ ${""}`} icon={DollarSign} />
        <Card title="Total Sales" value="₱ 12,450" icon={DollarSign} />
        <Card title="Transactions" value="128" icon={ShoppingCart} />
        <Card title="Products" value="56" icon={Package} />
        <Card title="Low Stock" value="7" icon={AlertTriangle} />
      </div>
    </div>
  );
};

export default Dashboard;