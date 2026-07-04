import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../index.css";
import logo from "../assets/logo.png";
import { Eye, EyeOff } from "lucide-react";
import bg from "../assets/bg.jpg";
import { sampleUsers } from "../data/sampleUsers";

const Login = () => {
  const [username, setUsername] = useState("user123");
  const [password, setPassword] = useState("12345");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  function handleLogin() {
    const user = sampleUsers.find(
      (u) => u.username === username && u.password === password,
    );

    if (!user) {
      toast.error("Invalid username or password");
      return;
    }

    localStorage.setItem("user", JSON.stringify(user));

    toast.success("Login Successful!");
    navigate("/app/dashboard");
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4"
      style={{
        backgroundImage: `url(${bg})`,
      }}
    >
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/25 via-white/5 to-transparent pointer-events-none" />

      {/* dark overlay */}
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="relative z-10 w-full max-w-sm sm:max-w-md rounded-3xl p-6 sm:p-8 md:p-10 bg-white/10 backdrop-blur-3xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.35)] overflow-hidden">
        {/* subtle glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-40" />

        <div className="relative flex flex-col gap-6">
          {/* Logo */}
          <div className="flex justify-center">
            <img src={logo} alt="logo" className="w-70 mx-auto" />
          </div>
          {/* Title */}
          <div className="relative text-center mb-3">
            <h2 className="text-3xl sm:text-4xl md:text-4xl font-light tracking-wide text-white">
              WELCOME TO
            </h2>

            <h1 className="text-2xl sm:text-3xl md:text-3xl font-extrabold text-white drop-shadow-lg">
              ALING NENA STORE
            </h1>
            <p className="my-4 text-xs sm:text-sm text-white/70 max-w-md text-center leading-relaxed">
              This project was originally created as a sample. It has since been sold and is now in active use by its new owner.
            </p>
          </div>
          {/* Inputs */}
          <div className="space-y-2">
            {/* Username */}
            <div>
              <label className="text-xs text-white">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                placeholder="Enter username"
                className="w-full px-4 py-3 mt-1 rounded-xl border border-white/40 bg-white/20 backdrop-blur-xl text-sm sm:text-base text-white placeholder:text-white/70 outline-none focus:border-white/70 focus:ring-4 focus:ring-white/20 transition shadow-lg"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-white">Password</label>

              <div className="relative mt-1">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 rounded-xl border border-white/40 bg-white/20 backdrop-blur-xl text-sm sm:text-base text-white placeholder:text-white/70 outline-none focus:border-white/70 focus:ring-4 focus:ring-white/20 transition shadow-lg"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={handleLogin}
            className="w-full h-14 rounded-2xl bg-gradient-to-b from-orange-300 via-orange-500 to-amber-600 border border-white/40 text-white font-semibold tracking-wide shadow-[0_10px_30px_rgba(234,88,12,0.45)] hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98] transition-all duration-300"
          >
            LOGIN
          </button>
          {/* Footer */}
          <p className="mt-4 text-center text-[10px] sm:text-xs text-white/80 tracking-wide">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold">Arwin Janoyan</span>. All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
