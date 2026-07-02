import React from "react";
import { useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../index.css";
import logo from "../assets/logo.png";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("omboy");
  const [password, setPassword] = useState("12345");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  async function handleLogin() {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .maybeSingle();
    if (error || !data) {
      toast.error("Invalid username or password");
      return;
    }

    localStorage.setItem("user", JSON.stringify(data));
    toast.success("Login Successful!");
    navigate("/app/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4">
      <div className="w-full max-w-sm bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-gray-100 relative overflow-hidden">
        {/* subtle glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-200 rounded-full blur-3xl opacity-40" />

        <div className="relative flex flex-col gap-5">
          {/* Logo */}
          <div className="flex justify-center">
            <img src={logo} className="w-60" alt="logo" />
          </div>

          {/* Title */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-sm text-gray-500">Sign in to continue</p>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="text-xs text-gray-500">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                placeholder="Enter username"
                className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-gray-500">Password</label>

              <div className="relative mt-1">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-600 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={handleLogin}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-95 transition"
          >
            Login
          </button>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-2">
            © {new Date().getFullYear()} Arwin Janoyan. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
