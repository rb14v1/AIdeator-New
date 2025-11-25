import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import Footer from "../Footer";
import Header from "../Header";
 
const Login = () => {
  const [data, setData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
 
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const isAdmin = localStorage.getItem("isAdmin") === "true";
 
    const validateToken = async () => {
      try {
        const res = await API.get("/user/");
        if (res.data && res.data.email) {
          navigate(isAdmin ? "/admin-page" : "/user-page");
        }
      } catch {
        localStorage.clear();
      }
    };
 
    if (token) validateToken();
  }, [navigate]);
 
  const onChangeHandler = (e) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
 
    try {
      const res = await API.post("/token/", data);
      const { access, refresh } = res.data;
 
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
 
      const userRes = await API.get("/user/");
      const user = userRes.data;
 
      localStorage.setItem("isAdmin", user.is_staff);
      navigate(user.is_staff ? "/admin-page" : "/user-page");
    } catch {
      setError("Invalid Email or Password");
    }
  };
 
  return (
    <div className="min-h-screen flex flex-col justify-between bg-teal-100 text-black">
      <Header />
      <div className="flex-grow flex items-center pt-13 justify-center">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
          <h2 className="text-2xl font-bold mb-2 text-center">Login</h2>
          <p className="text-sm text-gray-600 mb-6 text-center">Please sign in to continue</p>
 
          {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
 
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={data.email}
            onChange={onChangeHandler}
            className="w-full mb-4 p-2 border rounded focus:ring-2 focus:ring-teal-500"
            required
          />
 
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={data.password}
            onChange={onChangeHandler}
            className="w-full mb-6 p-2 border rounded focus:ring-2 focus:ring-teal-500"
            required
          />
 
          <button className="w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-700 transition">
            Login
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};
 
export default Login;
 
 