"use client";

import React, { useId } from "react";
import { en } from "@/locales/en";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { loginSchema, type LoginInput } from "@/features/auth/schema";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { useLogin } from "@/features/auth/hooks/use-login";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { useSimulation } from "@/features/simulation";

export const SignInCard = () => {
  const { launchInstantDemo } = useSimulation();
  const loginMutation = useLogin();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const rawCallbackUrl = searchParams.get("callbackUrl");
  const signUpUrl = rawCallbackUrl
    ? `/sign-up?callbackUrl=${encodeURIComponent(rawCallbackUrl)}`
    : "/sign-up";

  const emailId = useId();
  const emailErrorId = useId();
  const passwordId = useId();
  const passwordErrorId = useId();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        toast.success(en.auth.signIn.toastSuccess);
        router.push(callbackUrl);
      },
      onError: (error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : en.auth.signIn.toastErrorFallback;
        form.setError("root", { message });
        toast.error(message);
      },
    });
  };

  const handleDemoAccess = async () => {
    await launchInstantDemo();
  };

  return (
    <Card className="w-full md:w-[440px] rounded-xl border border-border/80 bg-card shadow-xl">
      <CardHeader className="flex flex-col items-center justify-center text-center p-6 pb-4">
        <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
          {en.auth.signIn.title}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground mt-1">
          {en.auth.signIn.description}
        </CardDescription>
      </CardHeader>
      <div className="px-6">
        <Separator />
      </div>
      <CardContent className="p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
          {form.formState.errors.root && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive-text text-xs font-medium"
            >
              {form.formState.errors.root.message}
            </div>
          )}
          <FieldGroup className="space-y-3.5">
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field invalid={!!fieldState.error}>
                  <FieldLabel htmlFor={emailId} className="text-xs font-medium">
                    {en.auth.signIn.emailLabel}
                  </FieldLabel>
                  <Input
                    id={emailId}
                    type="email"
                    autoComplete="email"
                    placeholder={en.auth.signIn.emailPlaceholder}
                    className="w-full h-9 rounded-lg text-xs"
                    aria-invalid={!!fieldState.error}
                    aria-describedby={fieldState.error ? emailErrorId : undefined}
                    {...field}
                  />
                  <FieldError id={emailErrorId}>
                    {fieldState.error?.message}
                  </FieldError>
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <Field invalid={!!fieldState.error}>
                  <FieldLabel htmlFor={passwordId} className="text-xs font-medium">
                    {en.auth.signIn.passwordLabel}
                  </FieldLabel>
                  <Input
                    id={passwordId}
                    type="password"
                    autoComplete="current-password"
                    placeholder={en.auth.signIn.passwordPlaceholder}
                    className="w-full h-9 rounded-lg text-xs"
                    aria-invalid={!!fieldState.error}
                    aria-describedby={fieldState.error ? passwordErrorId : undefined}
                    {...field}
                  />
                  <FieldError id={passwordErrorId}>
                    {fieldState.error?.message}
                  </FieldError>
                </Field>
              )}
            />
            <Button
              type="submit"
              className="w-full h-9 rounded-lg text-xs font-medium cursor-pointer"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending
                ? en.auth.signIn.submitButtonLoading
                : en.auth.signIn.submitButton}
            </Button>

            <div className="relative my-1 flex items-center gap-3">
              <div className="h-px flex-1 bg-border/80" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                or
              </span>
              <div className="h-px flex-1 bg-border/80" />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleDemoAccess}
              className="w-full h-9 rounded-lg text-xs cursor-pointer gap-2 border-primary/35 bg-primary/10 text-brand-text hover:bg-primary/15 font-medium"
            >
              <Sparkles className="size-3.5" />
              Instant Demo Sandbox Access
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
      <div className="px-6">
        <Separator />
      </div>
      <CardContent className="p-5 flex justify-center text-center">
        <p className="text-xs text-muted-foreground">
          {en.auth.signIn.footer}{" "}
          <Link
            href={signUpUrl}
            className="text-brand-text font-medium hover:underline"
          >
            {en.auth.signIn.footerLink}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};

export default SignInCard;
