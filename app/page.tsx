import Link from 'next/link';

export const dynamic = 'force-dynamic';
import { ensureDb, getPool } from '@/lib/db';

export default async function HomePage() {
  await ensureDb();
  const pool = getPool();

  const { rows: statsRows } = await pool.query(`
    SELECT COUNT(*) as total,
      SUM(CASE WHEN telehealth_available = 1 THEN 1 ELSE 0 END) as telehealth
    FROM providers WHERE verification_status = 'approved'
  `);
  const stats = statsRows[0] as { total: string; telehealth: string };

  const { rows: stateRows } = await pool.query(`
    SELECT COUNT(DISTINCT state) as states FROM providers WHERE verification_status = 'approved'
  `);
  const stateCount = stateRows[0] as { states: string };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-800 to-brand-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-white/10 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            Education-first • Provider-verified • No sales
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            Find Verified Peptide Therapy Providers Near You
          </h1>
          <p className="text-xl text-brand-100 mb-4 max-w-2xl mx-auto">
            Connect with licensed medical providers, clinics, and telehealth practices for a professional evaluation — the right way.
          </p>
          <div className="disclaimer-box bg-white/10 border-white/20 text-white/90 text-sm mb-8 max-w-xl mx-auto">
            <strong>Educational directory only.</strong> Not medical advice. Not a pharmacy. Not a peptide seller. Always consult a licensed clinician.
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quiz" className="btn-primary bg-white text-brand-700 hover:bg-brand-50 text-base px-8 py-3">
              Take the Peptide Survey
            </Link>
            <Link href="/providers" className="btn-ghost text-base px-8 py-3">
              Browse Providers
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-brand-700">{stats.total}</div>
            <div className="text-sm text-gray-500 mt-1">Verified Providers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-brand-700">{stats.telehealth}</div>
            <div className="text-sm text-gray-500 mt-1">Telehealth Options</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-brand-700">{stateCount.states}</div>
            <div className="text-sm text-gray-500 mt-1">States Covered</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center mb-2">How It Works</h2>
          <p className="text-center text-gray-500 mb-10">Three steps to connect with a verified provider</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: '📋',
                title: 'Take the Peptide Survey',
                desc: 'Answer a few questions about your goals, health history, and location. Get safe educational guidance tailored to your situation.',
              },
              {
                step: '02',
                icon: '🔍',
                title: 'Find Verified Providers',
                desc: 'Browse our directory of license-verified clinics and telehealth providers filtered by your location, goals, and preferred care type.',
              },
              {
                step: '03',
                icon: '🩺',
                title: 'Consult a Clinician',
                desc: 'Contact the provider of your choice to schedule a proper medical evaluation. Never start therapy without a clinician\'s oversight.',
              },
            ].map(item => (
              <div key={item.step} className="card p-6 text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="text-xs font-bold text-brand-500 mb-2 tracking-wide">STEP {item.step}</div>
                <h3 className="mb-2 text-gray-900">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety commitment */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="mb-4">Our Safety Commitment</h2>
              <ul className="space-y-3 text-gray-600">
                {[
                  'Every listed provider has submitted license information for review.',
                  'We do not list research-chemical sellers, bodybuilding shops, or unverified vendors.',
                  'No dosing recommendations, purchase links, or treatment plans are provided.',
                  'All listings include a "verification last reviewed" date.',
                  'Users can report suspicious or inaccurate listings at any time.',
                  'No peptides are sold on this platform.',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <div className="disclaimer-box">
                <p className="font-semibold mb-1">⚠ Important Notice</p>
                <p>
                  Peptide therapy is a medical treatment that must be prescribed and supervised by a licensed clinician.
                  This website provides education and a provider directory only — it is not a substitute for professional medical advice,
                  diagnosis, or treatment.
                </p>
              </div>
              <div className="card p-4 bg-brand-50 border-brand-100">
                <p className="text-brand-800 text-sm font-medium">Ready to learn more?</p>
                <p className="text-brand-700 text-sm mt-1 mb-3">
                  Read our education guide to understand peptide therapy categories, risks, and what to discuss with a clinician.
                </p>
                <Link href="/education" className="text-brand-600 text-sm font-medium hover:underline">
                  Read the Education Guide →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center mb-2">Common Wellness Goals</h2>
          <p className="text-center text-gray-500 mb-10 text-sm">
            Select a goal in the quiz to receive safe, education-based guidance.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '⚖️', label: 'Weight Management', desc: 'Metabolic health and body composition' },
              { icon: '💪', label: 'Recovery & Performance', desc: 'Injury recovery and physical conditioning' },
              { icon: '😴', label: 'Sleep & Wellness', desc: 'Sleep quality and general wellbeing' },
              { icon: '🧬', label: 'Hormone Health', desc: 'Hormonal optimization and balance' },
              { icon: '🔋', label: 'Energy & Vitality', desc: 'Metabolic function and daily energy' },
              { icon: '📚', label: 'Research & Education', desc: 'Learning about peptide therapy options' },
            ].map(cat => (
              <Link
                key={cat.label}
                href="/quiz"
                className="card p-5 hover:shadow-md transition-shadow hover:border-brand-200 group"
              >
                <div className="text-3xl mb-2">{cat.icon}</div>
                <h3 className="text-base font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
                  {cat.label}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{cat.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-brand-700 text-white text-center">
        <h2 className="mb-4 text-white">Ready to Find a Verified Provider?</h2>
        <p className="text-brand-200 mb-8 max-w-xl mx-auto">
          Take our short safety quiz first, then browse providers who match your location and goals.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/quiz" className="btn-primary bg-white text-brand-700 hover:bg-brand-50 px-8 py-3">
            Start the Quiz
          </Link>
          <Link href="/providers" className="btn-ghost px-8 py-3">
            Browse Directory
          </Link>
        </div>
      </section>
    </div>
  );
}
