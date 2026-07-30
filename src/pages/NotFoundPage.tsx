import { Link } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { SEO } from "../components/SEO";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SEO title="Page Not Found" description="The page you're looking for doesn't exist." noindex />
      <Header />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-red-600">404</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-4 max-w-md text-slate-600">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <Link
          to="/"
          className="mt-6 rounded-md bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-500"
        >
          Back to homepage
        </Link>
      </main>
      <Footer />
    </div>
  );
}
