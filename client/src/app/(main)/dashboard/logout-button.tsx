"use client";

import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/login/actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="destructive" className="cursor-pointer">
        Logout
      </Button>
    </form>
  );
}
