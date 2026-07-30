import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AD_PLACEMENTS } from "../lib/adsApi";

const whatWeNeed = [
  "Your advertiser or brand name",
  "A banner image at the exact size of your chosen placement",
  "The destination URL your ad should link to",
  "Your desired campaign start and end dates",
];

const imageGuidelines = [
  "Banner dimensions must match the chosen placement exactly",
  "JPG, PNG, or WebP format",
  "Clear, legible creative — avoid dense text or tiny fonts",
  "No misleading claims or deceptive imagery",
];

const steps = [
  {
    title: "Send us your details",
    body: "Share your banner image, destination link, and preferred campaign dates through our Contact page.",
  },
  {
    title: "We confirm placement and dates",
    body: "Our team reviews your creative against the guidelines below and confirms your slot and schedule.",
  },
  {
    title: "Your ad goes live automatically",
    body: "Once approved, your banner appears in its placement for exactly the dates you booked — no manual steps needed on your end.",
  },
];

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-2 text-slate-600">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function AdvertiseWithUsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Advertise With Us</h1>

        <p className="mt-5 text-lg leading-relaxed text-slate-700">
          Reach readers who come to <strong className="font-bold text-slate-900">Pal News</strong>{" "}
          for reliable coverage across India, world affairs, business, technology, sports,
          entertainment, and more.
        </p>
        <p className="mt-4 leading-relaxed text-slate-600">
          We keep our ad program simple and direct: your banner, placed prominently, for the
          dates you choose — no third-party ad network in between.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-slate-900">Ad Formats We Offer</h2>
        <p className="mt-3 leading-relaxed text-slate-600">
          We currently offer two banner placements in the site sidebar, shown on the homepage
          and every article page:
        </p>
        <ul className="mt-3 space-y-2 text-slate-600">
          {AD_PLACEMENTS.map((placement) => (
            <li key={placement.value} className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600" aria-hidden="true" />
              {placement.label} — an image banner that links directly to your site
            </li>
          ))}
        </ul>

        <h2 className="mt-10 text-2xl font-bold text-slate-900">What We Need From You</h2>
        <BulletList items={whatWeNeed} />

        <h2 className="mt-10 text-2xl font-bold text-slate-900">Image Guidelines</h2>
        <BulletList items={imageGuidelines} />

        <h2 className="mt-10 text-2xl font-bold text-slate-900">How It Works</h2>
        <div className="mt-4 space-y-5">
          {steps.map((step, index) => (
            <div key={step.title} className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white">
                {index + 1}
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
                <p className="mt-1 leading-relaxed text-slate-600">{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="mt-10 text-2xl font-bold text-slate-900">Get Started</h2>
        <p className="mt-3 leading-relaxed text-slate-600">
          Ready to advertise, or have questions about pricing and availability? Please contact us
          through our official Contact page and our team will get back to you.
        </p>

        <div className="mt-10 border-t border-slate-200 pt-6">
          <p className="text-base font-bold text-slate-900">Pal News by Pal Media</p>
          <p className="mt-1 italic text-slate-500">
            Trusted News. Meaningful Stories. Informed Readers.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
