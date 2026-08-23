import apiClient from "./apiClient";

export function registerUser(data) {
  return apiClient.post("/auth/register", data).then((res) => res.data);
}

export function loginUser(data) {
  return apiClient.post("/api/auth/login", data).then((res) => res.data);
}