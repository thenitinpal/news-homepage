import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

const coverageAreas = [
  "Breaking News",
  "World News",
  "India News",
  "Business & Finance",
  "Technology & AI",
  "Science & Innovation",
  "Entertainment",
  "Sports",
  "Health",
  "Lifestyle",
  "Education",
  "Opinion & Analysis",
];

const editorialValues = [
  {
    title: "Accuracy",
    body: "We verify information before publishing and strive to correct errors quickly and transparently.",
  },
  {
    title: "Integrity",
    body: "Our reporting remains independent, ethical, and free from misleading information.",
  },
  {
    title: "Transparency",
    body: "We believe readers deserve to know where information comes from and how stories are developed.",
  },
  {
    title: "Responsibility",
    body: "We understand the impact journalism has on society and publish with care and accountability.",
  },
];

const whyReaders = [
  "Fast and reliable news updates",
  "Well-researched and informative articles",
  "Clean, distraction-free reading experience",
  "Coverage across multiple categories",
  "Mobile-friendly platform",
  "Reader-first approach",
  "Commitment to factual reporting",
];

export function WhoWeArePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Who We Are</h1>

        <p className="mt-5 text-lg leading-relaxed text-slate-700">
          Welcome to <strong className="font-bold text-slate-900">Pal News</strong>, the digital
          news platform by <strong className="font-bold text-slate-900">Pal Media</strong>.
        </p>
        <p className="mt-4 leading-relaxed text-slate-600">
          We believe that quality journalism should be accessible to everyone. Our mission is to
          provide accurate, timely, and unbiased news that helps people stay informed about the
          events shaping our world.
        </p>
        <p className="mt-4 leading-relaxed text-slate-600">
          From breaking news and politics to technology, business, entertainment, sports, health,
          science, and lifestyle, Pal News delivers stories that matter—presented with clarity,
          credibility, and context.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-slate-900">Our Mission</h2>
        <p className="mt-3 leading-relaxed text-slate-600">
          Our mission is to become one of the world&apos;s most trusted digital news platforms by
          delivering factual reporting, insightful analysis, and meaningful stories that empower
          readers to make informed decisions.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-slate-900">Our Vision</h2>
        <p className="mt-3 leading-relaxed text-slate-600">
          We envision a future where everyone has access to reliable journalism without
          misinformation or unnecessary sensationalism. We strive to build a news platform that
          values truth, transparency, and public trust.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-slate-900">What We Cover</h2>
        <p className="mt-3 leading-relaxed text-slate-600">
          At Pal News, we publish news and in-depth articles across a wide range of topics:
        </p>
        <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-slate-600 sm:grid-cols-2">
          {coverageAreas.map((area) => (
            <li key={area} className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600" aria-hidden="true" />
              {area}
            </li>
          ))}
        </ul>

        <h2 className="mt-10 text-2xl font-bold text-slate-900">Our Editorial Values</h2>
        <p className="mt-3 leading-relaxed text-slate-600">
          Every article published on Pal News is guided by our core principles:
        </p>
        <div className="mt-4 space-y-5">
          {editorialValues.map((value) => (
            <div key={value.title}>
              <h3 className="text-base font-bold text-slate-900">{value.title}</h3>
              <p className="mt-1 leading-relaxed text-slate-600">{value.body}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-10 text-2xl font-bold text-slate-900">Why Readers Choose Pal News</h2>
        <ul className="mt-3 space-y-2 text-slate-600">
          {whyReaders.map((reason) => (
            <li key={reason} className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600" aria-hidden="true" />
              {reason}
            </li>
          ))}
        </ul>

        <h2 className="mt-10 text-2xl font-bold text-slate-900">Powered by Pal Media</h2>
        <p className="mt-3 leading-relaxed text-slate-600">
          Pal News is proudly operated by <strong className="font-bold text-slate-900">Pal Media</strong>,
          a digital media company focused on creating trusted online platforms that inform,
          educate, and engage audiences worldwide.
        </p>
        <p className="mt-4 leading-relaxed text-slate-600">
          Our goal is to leverage modern technology, thoughtful storytelling, and responsible
          journalism to build a better digital news experience.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-slate-900">Join Our Journey</h2>
        <p className="mt-3 leading-relaxed text-slate-600">
          The world changes every minute, and staying informed has never been more important.
        </p>
        <p className="mt-4 leading-relaxed text-slate-600">
          Whether you&apos;re reading today&apos;s headlines, exploring in-depth features, or
          following the latest developments in technology, business, politics, entertainment, or
          sports, Pal News is committed to bringing you credible information that matters.
        </p>
        <p className="mt-4 leading-relaxed text-slate-600">
          Thank you for being part of our growing community.
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
