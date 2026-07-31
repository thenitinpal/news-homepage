import { Link } from "react-router-dom";
import { LanguageSelector } from "./LanguageSelector";

interface FooterLink {
  label: string;
  href: string;
}

const linkColumns: { title: string; links: FooterLink[] }[] = [
  {
    title: "About Us",
    links: [
      { label: "Who We Are", href: "/who-we-are" },
      { label: "Editorial Team", href: "/editorial-team" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Advertise",
    links: [
      { label: "Advertise With Us", href: "/advertise" },
      { label: "Media Kit", href: "#" },
      { label: "Sponsored Content", href: "#" },
    ],
  },
];

const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/thepalnews", path: "M13 22v-8h3l1-4h-4V7.5C13 6.1 13.6 5 15.5 5H17V1.1C16.6 1 15.3 0.8 14 0.8 11.2 0.8 9 2.6 9 6v4H6v4h3v8h4z" },
  { label: "X", href: "https://x.com/PalNewsMedia", path: "M18 2h3l-7.5 8.6L22 22h-6.3l-4.9-6.4L5.2 22H2l8-9.2L2 2h6.4l4.4 5.9L18 2z" },
  { label: "Instagram", href: "https://www.instagram.com/palnewsbypalmedia/", path: "M12 2c2.7 0 3.1 0 4.1.1 1 0 1.7.2 2.3.5.6.2 1.1.6 1.6 1.1.5.5.8 1 1.1 1.6.3.6.4 1.3.5 2.3.1 1 .1 1.4.1 4.1s0 3.1-.1 4.1c0 1-.2 1.7-.5 2.3-.2.6-.6 1.1-1.1 1.6-.5.5-1 .8-1.6 1.1-.6.3-1.3.4-2.3.5-1 .1-1.4.1-4.1.1s-3.1 0-4.1-.1c-1 0-1.7-.2-2.3-.5-.6-.2-1.1-.6-1.6-1.1-.5-.5-.8-1-1.1-1.6-.3-.6-.4-1.3-.5-2.3C2 15.1 2 14.7 2 12s0-3.1.1-4.1c0-1 .2-1.7.5-2.3.2-.6.6-1.1 1.1-1.6.5-.5 1-.8 1.6-1.1.6-.3 1.3-.4 2.3-.5C8.9 2 9.3 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zm5.2-8.4a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4z" },
  { label: "YouTube", href: "https://www.youtube.com/@PalNewsbyPalMedia", path: "M23 12s0-3.6-.5-5.3c-.3-1-1-1.7-2-2C18.9 4.2 12 4.2 12 4.2s-6.9 0-8.5.5c-1 .3-1.7 1-2 2C1 8.4 1 12 1 12s0 3.6.5 5.3c.3 1 1 1.7 2 2 1.6.5 8.5.5 8.5.5s6.9 0 8.5-.5c1-.3 1.7-1 2-2 .5-1.7.5-5.3.5-5.3zM9.8 15.5V8.5l6 3.5-6 3.5z" },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:max-w-sm">
          {linkColumns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">{column.title}</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                {column.links.map((link) =>
                  link.href.startsWith("/") ? (
                    <li key={link.label}>
                      <Link to={link.href} className="hover:text-slate-900">
                        {link.label}
                      </Link>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <a href={link.href} className="hover:text-slate-900">
                        {link.label}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-6 border-t border-slate-200 pt-6">
          <p className="text-lg font-black tracking-tight text-slate-900">
            Pal<span className="text-red-600">News</span>
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <LanguageSelector />
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  {...(social.href !== "#"
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-red-600 hover:text-white"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          &copy; {new Date().getFullYear()} Pal News. All rights reserved
          <Link to="/admin" className="text-slate-400 no-underline hover:text-slate-400">
            .
          </Link>
        </p>
      </div>
    </footer>
  );
}
