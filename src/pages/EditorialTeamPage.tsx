import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

const responsibilities = [
  "Setting editorial standards and policies",
  "Reviewing and approving major news stories",
  "Maintaining accuracy and fact-checking standards",
  "Leading content strategy and newsroom operations",
  "Ensuring ethical and responsible journalism",
  "Overseeing breaking news coverage",
  "Driving innovation in digital journalism",
];

const editorialPrinciples = [
  {
    title: "Accuracy",
    body: "We verify information before publication and update stories whenever new verified information becomes available.",
  },
  {
    title: "Independence",
    body: "Our editorial decisions are made independently and are not influenced by advertisers, sponsors, or outside organisations.",
  },
  {
    title: "Fairness",
    body: "We strive to present multiple perspectives and avoid misleading or biased reporting.",
  },
  {
    title: "Transparency",
    body: "When corrections are necessary, we make them promptly and clearly.",
  },
  {
    title: "Accountability",
    body: "We take responsibility for our reporting and welcome constructive feedback from our readers.",
  },
];

const factCheckingSteps = [
  "Verification from credible sources",
  "Cross-checking facts and data",
  "Reviewing quotations and references",
  "Editorial review for clarity and accuracy",
  "Final approval before publication",
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

export function EditorialTeamPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Editorial Team</h1>

        <h2 className="mt-8 text-2xl font-bold text-slate-900">Our Editorial Commitment</h2>
        <p className="mt-3 leading-relaxed text-slate-600">
          At <strong className="font-bold text-slate-900">Pal News by Pal Media</strong>, our
          editorial team is committed to delivering accurate, balanced, and responsible
          journalism. Every story we publish is guided by integrity, transparency, and a
          dedication to factual reporting.
        </p>
        <p className="mt-4 leading-relaxed text-slate-600">
          Our goal is to provide readers with trustworthy news and insightful analysis while
          maintaining the highest standards of editorial ethics.
        </p>

        <div className="mt-10 rounded-xl border border-slate-200 p-6">
          <span className="text-xs font-bold uppercase tracking-wide text-red-600">
            Chief Editor
          </span>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Nitin Pal</h2>
          <p className="mt-1 font-semibold text-slate-700">Chief Editor | Founder, Pal News</p>

          <p className="mt-4 leading-relaxed text-slate-600">
            Nitin Pal leads the editorial vision of Pal News and oversees the publication&apos;s
            news coverage, editorial policies, and content quality.
          </p>
          <p className="mt-4 leading-relaxed text-slate-600">
            As Chief Editor, he is responsible for ensuring that every article published on Pal
            News meets our standards of accuracy, fairness, clarity, and credibility. He works
            closely with writers and contributors to maintain high-quality journalism while
            covering stories that matter to readers around the world.
          </p>
          <p className="mt-4 leading-relaxed text-slate-600">
            His vision is to build <strong className="font-bold text-slate-900">Pal News</strong>{" "}
            into a trusted global digital news platform where readers can access reliable
            information across politics, business, technology, entertainment, sports, science,
            health, and world affairs.
          </p>

          <h3 className="mt-6 text-base font-bold text-slate-900">Responsibilities</h3>
          <BulletList items={responsibilities} />
        </div>

        <h2 className="mt-10 text-2xl font-bold text-slate-900">Our Editorial Principles</h2>
        <p className="mt-3 leading-relaxed text-slate-600">
          Every article published by Pal News follows these core principles:
        </p>
        <div className="mt-4 space-y-5">
          {editorialPrinciples.map((principle) => (
            <div key={principle.title}>
              <h3 className="text-base font-bold text-slate-900">{principle.title}</h3>
              <p className="mt-1 leading-relaxed text-slate-600">{principle.body}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-10 text-2xl font-bold text-slate-900">Fact-Checking Process</h2>
        <p className="mt-3 leading-relaxed text-slate-600">
          Before publication, our editorial process includes:
        </p>
        <BulletList items={factCheckingSteps} />

        <h2 className="mt-10 text-2xl font-bold text-slate-900">Corrections Policy</h2>
        <p className="mt-3 leading-relaxed text-slate-600">
          If an error is identified in one of our articles, we investigate it promptly and
          publish corrections or updates whenever necessary. Maintaining reader trust is our
          highest priority.
        </p>
        <p className="mt-4 leading-relaxed text-slate-600">
          Readers who believe an article contains inaccurate information are encouraged to
          contact our editorial team.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-slate-900">Editorial Independence</h2>
        <p className="mt-3 leading-relaxed text-slate-600">
          Pal News maintains complete editorial independence. Our newsroom is committed to
          publishing content that serves the public interest and adheres to professional
          journalistic standards.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-slate-900">Contact the Editorial Team</h2>
        <p className="mt-3 leading-relaxed text-slate-600">
          For editorial enquiries, corrections, feedback, or story suggestions, please contact us
          through our official Contact page.
        </p>

        <div className="mt-10 border-t border-slate-200 pt-6">
          <p className="text-base font-bold text-slate-900">Pal News by Pal Media</p>
          <p className="mt-1 italic text-slate-500">Truth First. Facts Always.</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
