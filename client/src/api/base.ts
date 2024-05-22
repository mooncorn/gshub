import axios from "axios";

const token =
  typeof window !== "undefined" ? window.localStorage.getItem("jwtToken") : "";

export const base = axios.create({
  baseURL: "http://localhost:8080/",
  timeout: 1000,
  headers: { Authorization: `Bearer ${token}` },
});
