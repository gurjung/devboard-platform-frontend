"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/auth-context";
import type { RegisterInput } from "../schema";

export function useRegister() {
  const queryClient = useQueryClient();
  const { register } = useAuth();

  return useMutation({
    mutationFn: (data: RegisterInput) => register(data),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
