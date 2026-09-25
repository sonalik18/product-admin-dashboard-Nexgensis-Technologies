import api from "@/lib/axios";

export async function login(username, password) {
  const { data } = await api.post("/auth/login", {
    username,
    password,
    expiresInMins: 30,
  });
  return data;
}