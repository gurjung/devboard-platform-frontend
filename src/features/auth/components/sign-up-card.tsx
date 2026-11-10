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
import { registerSchema, type RegisterInput } from "@/features/auth/schema";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { useRegister } from "@/features/auth/hooks/use-register";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/features/auth/context/auth-context";

export const SignUpCard = () => {
  const { loginAsDemoUser } = useAuth();
  const registerMutation = useRegister();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const rawCallbackUrl = searchParams.get("callbackUrl");
  const signInUrl = rawCallbackUrl
    ? `/sign-in?callbackUrl=${encodeURIComponent(rawCallbackUrl)}`
    : "/sign-in";

  const nameId = useId();
  const nameErrorId = useId();
  const emailId = useId();
  const emailErrorId = useId();
  const passwordId = useId();
  const passwordErrorId = useId();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: RegisterInput) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        toast.success(en.auth.signUp.toastSuccess);
        router.push(callbackUrl);
      },
      onError: (error: unknown) => {
        const errMsg =
          error instanceof Error
            ? error.message
            : en.auth.signUp.toastErrorFallback;
        form.setError("root", { message: errMsg });
        toast.error(errMsg);
      },
    });
  };

  return (
    <Card className="w-full md:w-[440px] rounded-xl border border-border/80 bg-card shadow-xl">
      <CardHeader className="flex flex-col items-center justify-center text-center p-6 pb-4">
        <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
          {en.auth.signUp.title}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground mt-1 text-center leading-relaxed">
          {en.auth.signUp.description}{" "}
          <Link
            href="/privacy"
            className="text-brand-text font-medium hover:underline"
          >
            {en.auth.signUp.privacyPolicyLink}
          </Link>{" "}
          {en.common.and}{" "}
          <Link
            href="/terms"
            className="text-brand-text font-medium hover:underline"
          >
            {en.auth.signUp.termsLink}
          </Link>
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
              name="name"
              render={({ field, fieldState }) => (
                <Field invalid={!!fieldState.error}>
                  <FieldLabel htmlFor={nameId} className="text-xs font-medium">
                    {en.auth.signUp.nameLabel}
                  </FieldLabel>
                  <Input
                    id={nameId}
                    type="text"
                    autoComplete="name"
                    placeholder={en.auth.signUp.namePlaceholder}
                    className="w-full h-9 rounded-lg text-xs"
                    aria-invalid={!!fieldState.error}
                    aria-describedby={fieldState.error ? nameErrorId : undefined}
                    {...field}
                  />
                  <FieldError id={nameErrorId}>
                    {fieldState.error?.message}
                  </FieldError>
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field invalid={!!fieldState.error}>
                  <FieldLabel htmlFor={emailId} className="text-xs font-medium">
                    {en.auth.signUp.emailLabel}
                  </FieldLabel>
                  <Input
                    id={emailId}
                    type="email"
                    autoComplete="email"
                    placeholder={en.auth.signUp.emailPlaceholder}
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
                    {en.auth.signUp.passwordLabel}
                  </FieldLabel>
                  <Input
                    id={passwordId}
                    type="password"
                    autoComplete="new-password"
                    placeholder={en.auth.signUp.passwordPlaceholder}
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
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending
                ? en.auth.signUp.submitButtonLoading
                : en.auth.signUp.submitButton}
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
              onClick={async () => {
                try {
                  await loginAsDemoUser();
                  toast.success("Demo Mode Active: Welcome to DevBoard Engineering Workspace!");
                  router.push("/dashboard/devboard-engineering/projects/platform-core?view=kanban");
                } catch {
                  toast.error("Failed to initialize demo session.");
                }
              }}
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
          {en.auth.signUp.footer}{" "}
          <Link
            href={signInUrl}
            className="text-brand-text font-medium hover:underline"
          >
            {en.auth.signUp.footerLink}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};

export default SignUpCard;
