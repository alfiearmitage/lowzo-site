"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";

type NavbarProps = {
  initialLoggedIn?: boolean;
};

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Search", href: "/search" },
  { label: "Alerts", href: "/alerts" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Roadmap", href: "/roadmap" },
  { label: "About", href: "/about" },
];

export default function Navbar({ initialLoggedIn = false }: NavbarProps) {
  const { isLoggedIn: globalLoggedIn, setLoggedIn } = useAuth();

  const [mobileNavVisible, setMobileNavVisible] = useState(true);

  const isLoggedIn = initialLoggedIn || globalLoggedIn;

  useEffect(() => {
    if (initialLoggedIn) {
      setLoggedIn(true);
    }
  }, [initialLoggedIn, setLoggedIn]);

  useEffect(() => {
    let previousScrollY = window.scrollY;

    function handleScroll() {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 20) {
        setMobileNavVisible(true);
        previousScrollY = currentScrollY;
        return;
      }

      if (currentScrollY > previousScrollY + 8) {
        setMobileNavVisible(false);
      }

      if (currentScrollY < previousScrollY - 8) {
        setMobileNavVisible(true);
      }

      previousScrollY = currentScrollY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <style>{`
        .lowzo-desktop-navbar {
          width: 100%;
          height: 86px;
          background: #ffffff;
          border-bottom: 1px solid #eeeeee;
          position: relative;
          z-index: 50;
        }

        .lowzo-desktop-navbar-inner {
          width: min(1500px, calc(100% - 64px));
          height: 86px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 180px 1fr auto;
          align-items: center;
          gap: 34px;
        }

        .lowzo-desktop-logo {
          display: flex;
          align-items: center;
          width: fit-content;
          text-decoration: none;
        }

        .lowzo-desktop-logo img {
          width: 125px;
          height: auto;
          display: block;
        }

        .lowzo-desktop-links {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 34px;
        }

        .lowzo-desktop-links a {
          color: #111827;
          font-size: 15px;
          font-weight: 900;
          text-decoration: none;
          white-space: nowrap;
        }

        .lowzo-desktop-links a:hover {
          color: #ed1c2e;
        }

        .lowzo-auth-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .lowzo-login-link {
          min-width: 92px;
          height: 50px;
          border-radius: 999px;
          background: #ffffff;
          border: 1px solid #e4e7ec;
          color: #111827;
          display: grid;
          place-items: center;
          padding: 0 18px;
          font-size: 15px;
          font-weight: 900;
          text-decoration: none;
          white-space: nowrap;
        }

        .lowzo-desktop-cta {
          min-width: 130px;
          height: 50px;
          border-radius: 999px;
          background: #ed1c2e;
          color: #ffffff;
          display: grid;
          place-items: center;
          padding: 0 22px;
          font-size: 15px;
          font-weight: 900;
          text-decoration: none;
          box-shadow: 0 12px 26px rgba(237, 28, 46, 0.2);
          white-space: nowrap;
        }

        .lowzo-mobile-navbar {
          display: none;
        }

        @media (max-width: 760px) {
          body {
            padding-top: 106px;
          }

          .lowzo-desktop-navbar {
            display: none !important;
          }

          .lowzo-mobile-navbar {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 9999;
            background: rgba(255, 255, 255, 0.96);
            backdrop-filter: blur(18px);
            border-bottom: 1px solid #eeeeee;
            box-shadow: 0 12px 30px rgba(16, 24, 40, 0.08);
            transition: transform 0.24s ease;
          }

          .lowzo-mobile-navbar.visible {
            transform: translateY(0);
          }

          .lowzo-mobile-navbar.hidden {
            transform: translateY(-110%);
          }

          .lowzo-mobile-top {
            height: 58px;
            padding: 8px 14px 4px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .lowzo-mobile-logo {
            display: flex;
            align-items: center;
            text-decoration: none;
          }

          .lowzo-mobile-logo img {
            width: 100px;
            height: auto;
            display: block;
          }

          .lowzo-mobile-cta {
            background: #ed1c2e;
            color: #ffffff;
            border-radius: 999px;
            padding: 10px 16px;
            font-size: 13px;
            font-weight: 900;
            box-shadow: 0 8px 18px rgba(237, 28, 46, 0.2);
            text-decoration: none;
          }

          .lowzo-mobile-links {
            display: flex;
            gap: 10px;
            overflow-x: auto;
            padding: 8px 14px 12px;
            scrollbar-width: none;
          }

          .lowzo-mobile-links::-webkit-scrollbar {
            display: none;
          }

          .lowzo-mobile-links a {
            flex: 0 0 auto;
            color: #111111;
            background: #f8fafc;
            border: 1px solid #edf0f3;
            border-radius: 999px;
            padding: 9px 13px;
            font-size: 13px;
            font-weight: 900;
            white-space: nowrap;
            text-decoration: none;
          }
        }

        @media (min-width: 761px) {
          body {
            padding-top: 0 !important;
          }

          .lowzo-mobile-navbar {
            display: none !important;
          }

          .lowzo-desktop-navbar {
            display: block !important;
          }
        }
      `}</style>

      <header className="lowzo-desktop-navbar">
        <div className="lowzo-desktop-navbar-inner">
          <Link href="/" className="lowzo-desktop-logo">
            <img src="/lowzo-logo.png" alt="Lowzo" />
          </Link>

          <nav className="lowzo-desktop-links">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="lowzo-auth-actions">
            {isLoggedIn ? (
              <Link href="/account" className="lowzo-desktop-cta">
                Account
              </Link>
            ) : (
              <>
                <Link href="/login" className="lowzo-login-link">
                  Log in
                </Link>

                <Link href="/signup" className="lowzo-desktop-cta">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <nav
        className={
          mobileNavVisible
            ? "lowzo-mobile-navbar visible"
            : "lowzo-mobile-navbar hidden"
        }
      >
        <div className="lowzo-mobile-top">
          <Link href="/" className="lowzo-mobile-logo">
            <img src="/lowzo-logo.png" alt="Lowzo" />
          </Link>

          {isLoggedIn ? (
            <Link href="/account" className="lowzo-mobile-cta">
              Account
            </Link>
          ) : (
            <Link href="/signup" className="lowzo-mobile-cta">
              Sign up
            </Link>
          )}
        </div>

        <div className="lowzo-mobile-links">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}

          {!isLoggedIn && <Link href="/login">Log in</Link>}
        </div>
      </nav>
    </>
  );
}