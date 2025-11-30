"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { loginAction, signupAction } from "./actions";
import { initialAuthState, type AuthFormState } from "./state";

const signupBenefits = [
  "Secure account aggregation in seconds",
  "Personalized budgeting insights",
  "Automated bill reminders",
];

type View = "login" | "signup";

export default function LoginPage() {
  const [view, setView] = useState<View>("login");

  return (
    <div className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto flex max-w-2xl flex-col gap-10">
        <header className="space-y-2 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            FinanceFlex Portal
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {view === "login"
              ? "Welcome back"
              : "Create your FinanceFlex account"}
          </h1>
          <p className="text-muted-foreground">
            {view === "login"
              ? "Sign in to keep tracking budgets, cashflow, and goals."
              : "It only takes a minute to unlock guided plans, shared budgets and more."}
          </p>
        </header>

        <div className="mx-auto flex w-full max-w-xl rounded-full border border-border bg-card/50 p-1 text-sm font-medium shadow-sm">
          {(["login", "signup"] as View[]).map((option) => (
            <button
              key={option}
              onClick={() => setView(option)}
              className={`flex-1 rounded-full px-6 py-2 transition ${
                view === option
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground"
              }`}
            >
              {option === "login" ? "Login" : "Sign up"}
            </button>
          ))}
        </div>

        <section className="rounded-2xl border border-border bg-card/70 p-8 shadow-lg backdrop-blur">
          {view === "login" ? <LoginForm /> : <SignupForm />}
        </section>
      </div>
    </div>
  );
}

const inputClasses =
  "w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-base outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-primary/40";

function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialAuthState);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Existing users
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Sign in</h2>
        </div>
        <span className="rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold text-primary">
          2-step secure
        </span>
      </div>

      <form className="mt-8 space-y-6" action={formAction} noValidate>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Email address
          <input
            type="email"
            placeholder="brucewayne@financeflex.com"
            className={inputClasses}
            name="email"
            required
            autoComplete="email"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Password
          <input
            type="password"
            placeholder="•••••••••"
            className={inputClasses}
            name="password"
            required
            autoComplete="current-password"
          />
        </label>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <label className="inline-flex items-center gap-2 text-muted-foreground">
            <input type="checkbox" className="size-4 rounded border-border" />
            Remember me
          </label>
          <Link
            href="#"
            className="text-primary underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <FormMessage state={state} />
        <SubmitButton>Sign in</SubmitButton>
      </form>
    </>
  );
}

function SignupForm() {
  const [state, formAction] = useActionState(signupAction, initialAuthState);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            New here
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Create an account</h2>
        </div>
        <span className="rounded-full bg-secondary px-4 py-1 text-xs font-semibold text-secondary-foreground">
          Free user
        </span>
      </div>

      <form className="mt-8 space-y-6" action={formAction} noValidate>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Full name
          <input
            type="text"
            placeholder="Bruce Wayne"
            className={inputClasses}
            name="name"
            required
            autoComplete="name"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Email
          <input
            type="email"
            placeholder="brucewayne@financeflex.com"
            className={inputClasses}
            name="email"
            required
            autoComplete="email"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Choose password
          <input
            type="password"
            placeholder="Create a password"
            className={inputClasses}
            name="password"
            required
            autoComplete="new-password"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Confirm password
          <input
            type="password"
            placeholder="Confirm password"
            className={inputClasses}
            name="confirmPassword"
            required
            autoComplete="new-password"
          />
        </label>
        <FormMessage state={state} />
        <SubmitButton>Create account</SubmitButton>
      </form>

      <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
        {signupBenefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-3">
            <span className="mt-1 size-1.5 rounded-full bg-primary" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function FormMessage({ state }: { state: AuthFormState }) {
  if (state.status !== "error" || !state.message) return null;

  return (
    <p className="text-sm font-medium text-destructive">{state.message}</p>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="w-full py-3 text-base font-semibold"
      disabled={pending}
    >
      {pending ? "Please wait..." : children}
    </Button>
  );
}
