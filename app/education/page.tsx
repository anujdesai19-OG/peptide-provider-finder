import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Peptide Therapy Education',
  description: 'Learn about peptide therapy categories, risks, prescriptions, compounding, and why clinician oversight matters.',
};

const categories = [
  {
    id: 'weight',
    icon: '⚖️',
    title: 'Weight Management & Metabolic Health',
    content: `Peptides in this category may influence appetite regulation, metabolic rate, or fat metabolism. Several FDA-approved GLP-1 receptor agonists fall in this space. A licensed physician must evaluate your metabolic health, labs, and medical history before considering any therapy.

Key considerations for a clinician discussion include your current BMI and body composition goals, fasting insulin and glucose levels, cardiovascular risk factors, any history of pancreatitis or thyroid conditions, and realistic timeline expectations.`,
    warning: 'Never use weight-management peptides obtained without a valid prescription. FDA-approved options exist in this category — ask your provider specifically about regulatory status.',
  },
  {
    id: 'recovery',
    icon: '💪',
    title: 'Recovery & Injury Support',
    content: `Some peptides are being studied for their potential role in tissue repair, collagen synthesis, and inflammation modulation. This is an evolving area with a limited peer-reviewed evidence base. An accurate injury diagnosis is essential before any treatment decision.

A sports medicine physician, orthopedic specialist, or physiatrist can evaluate your specific injury, determine standard-of-care options, and assess whether any evidence-supported adjunct therapy is appropriate in your case.`,
    warning: 'Injury treatment should begin with a proper clinical diagnosis. Do not self-treat with peptides obtained online or without a prescription.',
  },
  {
    id: 'sleep',
    icon: '😴',
    title: 'Sleep & General Wellness',
    content: `Sleep disturbances and general wellness concerns often have treatable root causes including sleep apnea, thyroid dysfunction, mood disorders, or micronutrient deficiencies. These should be evaluated and addressed before considering any peptide therapy.

A primary care physician or sleep specialist can conduct a thorough evaluation, order appropriate testing, and discuss evidence-based options including lifestyle changes, behavioral therapies, and medications as appropriate.`,
    warning: 'Peptide therapy is not a first-line treatment for sleep disorders. Always rule out primary sleep conditions with a licensed clinician first.',
  },
  {
    id: 'hormones',
    icon: '🧬',
    title: 'Hormone & Metabolic Concerns',
    content: `Peptides that influence growth hormone release (growth hormone secretagogues) or other hormonal pathways require comprehensive baseline testing, ongoing monitoring, and a physician with expertise in endocrinology or hormone health.

Important lab markers typically include IGF-1, fasting insulin, comprehensive metabolic panel, and relevant hormone panels. Monitoring frequency and treatment duration should be determined by your clinician.`,
    warning: 'Growth hormone-related peptides are heavily regulated. Using them without a prescription and medical supervision carries significant health and legal risks.',
  },
];

const concepts = [
  {
    title: 'FDA-Approved Medications',
    desc: 'Some peptides are FDA-approved prescription medications, manufactured under strict quality controls. These are the gold standard for safety and efficacy data.',
  },
  {
    title: 'Compounded Preparations',
    desc: 'Licensed compounding pharmacies can prepare customized formulations under physician prescription. These are legal but carry different considerations from FDA-approved drugs — quality can vary by pharmacy.',
  },
  {
    title: 'Off-Label Prescribing',
    desc: 'Some providers prescribe FDA-approved peptides for uses not in the official labeling. This is legal and common in medicine, but the evidence base and liability considerations differ.',
  },
  {
    title: 'Research Chemicals (Do Not Use)',
    desc: 'Some websites sell peptides labeled "for research only" — these are not regulated for human use, have no quality assurance, and are not appropriate for therapeutic use. This directory does not list any such vendors.',
  },
];

export default function EducationPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <div className="disclaimer-box mb-6">
          <strong>Educational content only.</strong> This page provides general information about peptide therapy categories and concepts. It is not medical advice and should not be used to self-diagnose or self-treat. Always consult a licensed clinician.
        </div>
        <h1 className="mb-3">Understanding Peptide Therapy</h1>
        <p className="text-gray-600 text-lg">
          Peptides are short chains of amino acids that serve as signaling molecules in the body. Peptide therapy refers to the use of specific peptides — always under medical supervision — to support various health goals. Here is what you need to know before speaking with a provider.
        </p>
      </div>

      {/* What are peptides */}
      <section className="card p-6 mb-8">
        <h2 className="mb-3 text-gray-900">What Are Peptides?</h2>
        <p className="text-gray-600 mb-3">
          Your body naturally produces hundreds of peptides that regulate processes from metabolism to immune function. Peptide therapy involves administering specific peptide compounds — via injection, oral, or topical routes — to influence targeted biological pathways.
        </p>
        <p className="text-gray-600">
          Peptide therapy is an active area of medical research. Some peptides have robust clinical data; others have limited evidence. A qualified clinician can help you understand what evidence exists for your specific goals and health situation.
        </p>
      </section>

      {/* Why clinician oversight matters */}
      <section className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
        <h2 className="text-red-800 mb-3">Why Clinician Oversight Is Essential</h2>
        <ul className="space-y-2 text-red-700 text-sm">
          {[
            'Peptide therapy is a medical treatment — it requires a diagnosis, evaluation, and ongoing monitoring.',
            'Individual responses vary significantly based on genetics, health status, and other medications.',
            'Dosing errors and contaminated preparations from unregulated sources pose real health risks.',
            'Some peptides are contraindicated in certain cancers, cardiac conditions, or metabolic disorders.',
            'Only a licensed clinician who knows your full medical history can assess risk-benefit in your case.',
          ].map(item => (
            <li key={item} className="flex items-start gap-2">
              <span className="shrink-0 mt-0.5">⚠</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Categories */}
      <h2 className="mb-6">Common Therapy Categories</h2>
      <div className="space-y-6 mb-12">
        {categories.map(cat => (
          <div key={cat.id} className="card p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{cat.icon}</span>
              <h3 className="text-gray-900">{cat.title}</h3>
            </div>
            <div className="text-gray-600 text-sm whitespace-pre-line mb-4 leading-relaxed">
              {cat.content}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              <strong>⚠ Risk note:</strong> {cat.warning}
            </div>
          </div>
        ))}
      </div>

      {/* Key concepts */}
      <h2 className="mb-6">Key Concepts to Understand</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-12">
        {concepts.map(c => (
          <div key={c.title} className="card p-5">
            <h3 className="text-base text-gray-900 mb-2">{c.title}</h3>
            <p className="text-sm text-gray-600">{c.desc}</p>
          </div>
        ))}
      </div>

      {/* What to ask */}
      <section className="card p-6 bg-brand-50 border-brand-100 mb-8">
        <h2 className="mb-4 text-brand-900">Questions to Ask Your Provider</h2>
        <ul className="space-y-2 text-sm text-brand-800">
          {[
            'What evidence supports this peptide for my specific condition or goal?',
            'Is this an FDA-approved medication, a compounded preparation, or off-label use?',
            'What labs do I need before starting, and how often will we monitor?',
            'What are the potential side effects and contraindications for my health history?',
            'Which licensed pharmacy will prepare or dispense my prescription?',
            'What does the therapy cost, and is it covered by insurance?',
            'How will we know if the therapy is working, and when would we stop?',
          ].map(q => (
            <li key={q} className="flex items-start gap-2">
              <span className="text-brand-500 shrink-0">→</span>
              <span>{q}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <div className="text-center">
        <p className="text-gray-600 mb-4">Ready to find a verified provider to discuss your goals?</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/quiz" className="btn-primary">Take the Peptide Survey</Link>
          <Link href="/providers" className="btn-secondary">Browse Providers</Link>
        </div>
      </div>
    </div>
  );
}
