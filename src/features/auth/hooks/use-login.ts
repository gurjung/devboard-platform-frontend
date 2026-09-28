"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/auth-context";
import type { LoginInput } from "../schema";

export function useLogin() {
  const queryClient = useQueryClient();
  const { login } = useAuth();

  return useMutation({
    mutationFn: (credentials: LoginInput) => login(credentials),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
