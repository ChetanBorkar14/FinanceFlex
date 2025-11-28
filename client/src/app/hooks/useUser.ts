// hooks/useUser.ts
"use client";

import { useEffect, useState } from "react";

type UserProfile = {
  user_id: string;
  name: string | null;
  email: string | null;
};

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const res = await fetch("/api/me", {
          credentials: "include",
        });

        if (!res.ok) {
          if (active) setUser(null);
          return;
        }

        const data = await res.json();
        if (active) {
          setUser(data.user);
        }
      } catch (error) {
        if (active) setUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadUser();

    return () => {
      active = false;
    };
  }, []);

  const displayName =
    user?.name?.trim() ||
    user?.email?.split("@")[0] ||
    (user ? "User" : "");

  return { user, displayName, isLoading };
}
