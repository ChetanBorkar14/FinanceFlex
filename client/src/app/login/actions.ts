"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

import { createServiceSupabaseClient } from "@/lib/supabase/service-client";
import {
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/auth/session";
import type { AuthFormState } from "./state";

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

function sanitize(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function signupAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const name = sanitize(formData.get("name"));
  const email = sanitize(formData.get("email")).toLowerCase();
  const password = sanitize(formData.get("password"));
  const confirmPassword = sanitize(formData.get("confirmPassword"));

  if (!name || !email || !password || !confirmPassword) {
    return { status: "error", message: "All fields are required." };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  if (password.length < 8) {
    return {
      status: "error",
      message: "Password must be at least 8 characters long.",
    };
  }

  if (password !== confirmPassword) {
    return { status: "error", message: "Passwords do not match." };
  }

  const supabase = createServiceSupabaseClient();

  const { data: existingUser, error: existingError } = await supabase
    .from("users")
    .select("user_id")
    .eq("email", email)
    .maybeSingle();

  if (existingError) {
    return {
      status: "error",
      message: "Something went wrong while checking your account.",
    };
  }

  if (existingUser) {
    return {
      status: "error",
      message: "That email is already registered. Try logging in instead.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const userId = randomUUID();

  const { error: insertError } = await supabase.from("users").insert({
    user_id: userId,
    name,
    email,
    password_hash: passwordHash,
  });

  if (insertError) {
    return {
      status: "error",
      message: "We could not create your account. Please try again.",
    };
  }

  const token = await createSessionToken({ sub: userId, email, name });
  await setSessionCookie(token);

  redirect("/dashboard");
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = sanitize(formData.get("email")).toLowerCase();
  const password = sanitize(formData.get("password"));

  if (!email || !password) {
    return { status: "error", message: "Email and password are required." };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  const supabase = createServiceSupabaseClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("user_id, name, email, password_hash")
    .eq("email", email)
    .maybeSingle();

  if (error || !user) {
    return {
      status: "error",
      message: "Invalid email or password.",
    };
  }

  const isValidPassword = await bcrypt.compare(
    password,
    user.password_hash ?? ""
  );

  if (!isValidPassword) {
    return {
      status: "error",
      message: "Invalid email or password.",
    };
  }

  const token = await createSessionToken({
    sub: user.user_id,
    email: user.email,
    name: user.name,
  });
  await setSessionCookie(token);

  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

