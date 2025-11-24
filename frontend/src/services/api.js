import axios from "axios";

const API = axios.create({
  baseURL: "http://13.222.154.187" ,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("✅ Token attached:", config.headers.Authorization);
  } else {
    console.warn("⚠️ No access token found in localStorage");
  }
  return config;
}, (error) => Promise.reject(error));

export default API;

