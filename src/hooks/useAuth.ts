import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { decodeJWT, getToken } from "@/lib/auth";

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: string;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user, isLoading, isError } = useQuery<User | null>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const token = getToken();
      if (!token) return null;

      const decoded = decodeJWT(token);
      if (!decoded || (decoded.exp && decoded.exp * 1000 < Date.now())) {
        localStorage.clear();
        return null;
      }

      // If there's a /auth/me endpoint, we should call it here to verify the token
      // For now, we trust the token and return the data from it
      // try {
      //   const res = await api.get("/auth/me");
      //   return res.data;
      // } catch {
      //   localStorage.clear();
      //   return null;
      // }

      const userFromStorage = localStorage.getItem("user");
      return userFromStorage ? JSON.parse(userFromStorage) : decoded;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const response = await api.post("/auth/login", credentials);
      return response.data;
    },
    onSuccess: (data) => {
      const { token, user } = data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.role.toUpperCase());
      
      queryClient.setQueryData(["auth", "me"], user);
      navigate("/welcome");
    },
  });

  const logout = () => {
    localStorage.clear();
    queryClient.setQueryData(["auth", "me"], null);
    queryClient.clear();
    navigate("/login");
  };

  return {
    user,
    isLoading,
    isError,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    loginPending: loginMutation.isPending,
    loginError: loginMutation.error,
    logout,
  };
}
