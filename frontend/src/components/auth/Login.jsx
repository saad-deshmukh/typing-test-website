import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        login(data.user, data.token);
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (err) {
      setMessage("Server error. Try again later.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-mono flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800/50 border border-slate-700 rounded-lg p-8 backdrop-blur-sm">
        <h2 className="text-3xl font-bold text-center text-cyan-300 mb-6">Login</h2>
        {message && (
          <p className="text-red-400 text-center font-medium mb-4">{message}</p>
        )}
        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-300"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-300"
          />
          <button
            type="submit"
            className="w-full py-3 bg-cyan-500 text-slate-900 font-semibold rounded-lg hover:bg-cyan-400 transition-all duration-300 shadow-lg shadow-cyan-500/20"
          >
            Login
          </button>
        </form>
        <p className="text-sm text-slate-400 text-center mt-6">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-cyan-400 hover:underline cursor-pointer"
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
