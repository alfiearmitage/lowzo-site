"use client";

import { useEffect } from "react";

type AuthStateSyncProps = {
  loggedIn: boolean;
};

export default function AuthStateSync({ loggedIn }: AuthStateSyncProps) {
  useEffect(() => {
    if (loggedIn) {
      window.localStorage.setItem("lowzo_logged_in", "1");
      document.cookie =
        "lowzo_logged_in=1; path=/; max-age=604800; samesite=lax";
      window.dispatchEvent(new Event("lowzo-auth-changed"));
      return;
    }

    window.localStorage.removeItem("lowzo_logged_in");
    document.cookie = "lowzo_logged_in=; path=/; max-age=0; samesite=lax";
    window.dispatchEvent(new Event("lowzo-auth-changed"));
  }, [loggedIn]);

  return null;
}