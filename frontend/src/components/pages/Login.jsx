import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [data, setData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    const validateToken = async () => {
      try {
        const res = await axios.get("http://13.222.154.187/api/user/", {
          headers: { Authorization: `Bearer ${token}` },
        });

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
    const res = await axios.post("http://13.222.154.187/api/token/", {
      email: data.email,
      password: data.password,
    });

    const { access, refresh } = res.data;
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);

    const userRes = await axios.get("http://13.222.154.187/api/user/", {
      headers: { Authorization: `Bearer ${access}` },
    });

    const user = userRes.data;
    localStorage.setItem("isAdmin", user.is_staff);
    navigate(user.is_staff ? "/admin-page" : "/user-page");
  } catch (err) {
    setError("Login failed");
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-teal-100 text-black">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-center">Login</h2>
        <p className="text-sm text-gray-600 mb-6 text-center">Please sign in to continue.</p>

        {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

        <input
          type="email"
          name="email"
          placeholder="Email id"
          value={data.email}
          onChange={onChangeHandler}
          className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={data.password}
          onChange={onChangeHandler}
          className="w-full mb-6 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        />

        <button
          type="submit"
          className="w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;