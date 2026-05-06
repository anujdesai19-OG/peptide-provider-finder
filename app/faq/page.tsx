import type { Metadata } from 'next';
import { ensureDb, getPool } from '@/lib/db';
import { FaqItem } from '@/lib/types';
import FaqAccordion from './FaqAccordion';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about peptide therapy, legality, prescriptions, compounding, safety, and how to find a verified provider.',
};

export const dynamic = 'force-dynamic';

export default async function FaqPage() {
  await ensureDb();
  const pool = getPool();
  const { rows: items } = await pool.query(
    `SELECT * FROM faq_items WHERE is_published = 1 ORDER BY sort_order ASC`
  );

  const categories = [...new Set((items as FaqItem[]).map(i => i.category))];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="mb-3">Frequently Asked Questions</h1>
        <p className="text-gray-600">
          Answers to common questions about peptide therapy, safety, legality, and how this directory works.
        </p>
        <div className="disclaimer-box mt-6 text-sm text-left">
          <strong>Reminder:</strong> These FAQs are for general education only and do not constitute medical, legal, or pharmacy advice. Consult a licensed clinician and/or attorney for advice specific to your situation.
        </div>
      </div>

      {categories.map(cat => (
        <div key={cat} className="mb-10">
          <h2 className="text-base font-semibold text-brand-700 uppercase tracking-wide mb-4">
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </h2>
          <FaqAccordion items={(items as FaqItem[]).filter(i => i.category === cat)} />
        </div>
      ))}

      <div className="card p-6 text-center mt-8">
        <h3 className="mb-2">Still have questions?</h3>
        <p className="text-sm text-gray-600 mb-4">
          Contact us or use our directory to find a verified provider who can answer your clinical questions directly.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="/contact" className="btn-secondary text-sm">Contact Us</a>
          <a href="/providers" className="btn-primary text-sm">Find a Provider</a>
        </div>
      </div>
    </div>
  );
}
