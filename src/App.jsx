import "./index.css";
import { Toaster } from "react-hot-toast";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Pos from "./pages/Pos";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Layout from "./pages/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <Toaster />

      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* App Layout */}
        <Route element ={<ProtectedRoute/>}>
          <Route path="/app" element={<Layout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="pos" element={<Pos />} />
            <Route path="products" element={<Products />} />
            <Route path="sales" element={<Sales />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/login" />} />

        {/* Redirect */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
}

export default App;