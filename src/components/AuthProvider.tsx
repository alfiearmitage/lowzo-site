"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AuthContextValue = {
  isLoggedIn: boolean;
  setLoggedIn: (value: boolean) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  initialLoggedIn: boolean;
  children: ReactNode;
};

export default function AuthProvider({
  initialLoggedIn,
  children,
}: AuthProviderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(initialLoggedIn);

  function setLoggedIn(value: boolean) {
    setIsLoggedIn(value);

    try {
      if (value) {
        window.localStorage.setItem("lowzo_logged_in", "1");
        document.cookie =
          "lowzo_logged_in=1; path=/; max-age=604800; samesite=lax";
      } else {
        window.localStorage.removeItem("lowzo_logged_in");
        document.cookie =
          "lowzo_logged_in=; path=/; max-age=0; samesite=lax";
      }
    } catch {
      // Ignore browser storage issues.
    }
  }

  useEffect(() => {
    setLoggedIn(initialLoggedIn);
  }, [initialLoggedIn]);

  const value = useMemo(
    () => ({
      isLoggedIn,
      setLoggedIn,
    }),
    [isLoggedIn]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    return {
      isLoggedIn: false,
      setLoggedIn: () => {},
    };
  }

  return context;
}