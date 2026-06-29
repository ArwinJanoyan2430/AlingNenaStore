import React from 'react'
import {useState} from 'react'
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import '../index.css'
import logo from "../assets/logo.png"

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    async function handleLogin(){
        const {data, error} = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .eq("password", password)
        .single();

        if (error || !data){
            toast.error("Invalid username or password");
            return;
        }

        localStorage.setItem("user",JSON.stringify(data));
        toast.success("Login Successful!");
        navigate("/app/dashboard");

    }

    

  return (
    <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-[300px] sm:max-w-sm bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl p-6 sm:p-8 border border-gray-100">
            <div className="flex flex-col gap-4 ">
                <div className="flex justify-center -mb-5">
                    <img src={logo} className="w-60 h-40 sm:w-60 sm:h-40 rounded-xl"  alt="logo" />
                </div>
                <div className="space-y-3">
                    <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        type="text"
                        placeholder="username"
                        className="w-full px-4 py-3 text-[16px] rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-orange-900 focus:ring-4 focus:ring-amber-700/30"
                        />

                        <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        placeholder="password"
                        className="w-full px-4 py-3 text-[16px] rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-orange-900 focus:ring-4 focus:ring-amber-700/30"
                        />
                </div>
                <button className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-amber-700 to-orange-900 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition text-sm sm:text-base" onClick={handleLogin}>
                    Login
                </button>
                <p className="text-center text-xs text-gray-400 mt-4">
                © {new Date().getFullYear()} Arwin Janoyan. All rights reserved.
                </p>
            </div>
        </div>
    </div>
    
  )
}

export default Login;