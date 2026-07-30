import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { NAV_ITEMS } from "../data/navigation";
import { SearchToggle } from "./SearchToggle";
import { MobileNav } from "./MobileNav";
import { SubscribeButton } from "./SubscribeButton";
import { useAuth } from "../context/AuthContext";

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { session, profile } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      {/* Top utility bar */}
      <div className="bg-slate-900 text-slate-300">
        <div className="flex items-center justify-between px-4 py-1.5 text-xs sm:px-6 lg:px-10">
          <span>{today}</span>
          <div className="flex items-center gap-3">
            {session ? (
              <Link
                to="/account"
                aria-label="My account"
                className="flex items-center gap-1.5 hover:text-white"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M4.5 20c1.5-4 4.5-6 7.5-6s6 2 7.5 6" strokeLinecap="round" />
                </svg>
                {profile?.displayName ?? "Account"}
              </Link>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-slate-800 px-3 py-1 font-semibold text-slate-200 hover:bg-slate-700 hover:text-white"
              >
                Sign in / Sign up
              </Link>
            )}
            <SubscribeButton />
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="flex items-center gap-4 px-4 py-3 sm:px-6 lg:px-10">
        <Link to="/" className="flex shrink-0 flex-col leading-tight">
          <span className="text-2xl font-black tracking-tight text-slate-900">
            Pal<span className="text-red-600">News</span>
          </span>
          <span className="text-xs font-normal text-slate-500">by Pal Media</span>
        </Link>

        <div className="hidden md:block">
          <SearchToggle variant="expanded" />
        </div>

        <div className="flex-1" />

        <nav aria-label="Primary" className="hidden md:flex items-center gap-3.5 lg:gap-5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `whitespace-nowrap text-sm font-semibold ${
                  isActive ? "text-red-600" : "text-slate-700 hover:text-red-600"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <div className="md:hidden">
            <SearchToggle variant="compact" />
          </div>
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 md:hidden"
          >
            <span aria-hidden="true" className="text-xl leading-none">
              &#9776;
            </span>
          </button>
        </div>
      </div>

      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </header>
  );
}
