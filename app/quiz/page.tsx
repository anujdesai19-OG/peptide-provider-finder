'use client';
import { useState } from 'react';
import Link from 'next/link';

interface Step {
  id: string;
  question: string;
  note?: string;
  options: { value: string; label: string; icon?: string }[];
}

const steps: Step[] = [
  {
    id: 'goal',
    question: 'What is your primary wellness goal?',
    note: 'Select the option that best describes your main interest. This helps us provide relevant educational guidance.',
    options: [
      { value: 'weight management', label: 'Weight Management & Metabolic Health', icon: '⚖️' },
      { value: 'recovery', label: 'Recovery & Injury Support', icon: '💪' },
      { value: 'sleep', label: 'Sleep & General Wellness', icon: '😴' },
      { value: 'hormone', label: 'Hormone & Metabolic Concerns', icon: '🧬' },
      { value: 'research', label: 'Research & Education Only', icon: '📚' },
    ],
  },
  {
    id: 'medications',
    question: 'Are you currently taking any prescription medications?',
    note: 'This is for educational guidance only. Your clinician will conduct a full medication review.',
    options: [
      { value: 'no', label: 'No prescription medications' },
      { value: 'yes_simple', label: 'Yes, for common conditions (e.g., blood pressure, cholesterol)' },
      { value: 'yes_complex', label: 'Yes, including immunosuppressants, chemotherapy, or hormone therapies' },
      { value: 'unsure', label: 'Unsure / prefer not to say' },
    ],
  },
  {
    id: 'conditions',
    question: 'Do you have any of the following health conditions?',
    note: 'This helps us flag important considerations to discuss with a clinician.',
    options: [
      { value: 'none', label: 'No significant health conditions' },
      { value: 'metabolic', label: 'Diabetes, prediabetes, or insulin resistance' },
      { value: 'cardiac', label: 'Heart disease or cardiovascular conditions' },
      { value: 'cancer', label: 'Active cancer or history of certain cancers' },
      { value: 'other', label: 'Other chronic conditions' },
    ],
  },
  {
    id: 'willing_labs',
    question: 'Are you willing to complete lab work before starting any therapy?',
    note: 'Most legitimate peptide therapy protocols require baseline labs. This is a safety requirement, not optional.',
    options: [
      { value: 'yes', label: 'Yes, I understand labs are required' },
      { value: 'maybe', label: 'Maybe — I would like to understand what is involved first' },
      { value: 'no', label: 'I would prefer to avoid labs' },
    ],
  },
  {
    id: 'care_type',
    question: 'What type of care do you prefer?',
    options: [
      { value: 'in_person', label: 'In-person clinic visit', icon: '🏥' },
      { value: 'telehealth', label: 'Telehealth / remote consultation', icon: '💻' },
      { value: 'either', label: 'Either works for me', icon: '✓' },
    ],
  },
  {
    id: 'location',
    question: 'What is your state of residence?',
    note: 'Providers must be licensed in your state to prescribe. This helps filter relevant listings.',
    options: [
      { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' },
      { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
      { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
      { value: 'CT', label: 'Connecticut' }, { value: 'FL', label: 'Florida' },
      { value: 'GA', label: 'Georgia' }, { value: 'IL', label: 'Illinois' },
      { value: 'MA', label: 'Massachusetts' }, { value: 'MI', label: 'Michigan' },
      { value: 'MN', label: 'Minnesota' }, { value: 'NV', label: 'Nevada' },
      { value: 'NJ', label: 'New Jersey' }, { value: 'NY', label: 'New York' },
      { value: 'NC', label: 'North Carolina' }, { value: 'OH', label: 'Ohio' },
      { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' },
      { value: 'TN', label: 'Tennessee' }, { value: 'TX', label: 'Texas' },
      { value: 'UT', label: 'Utah' }, { value: 'VA', label: 'Virginia' },
      { value: 'WA', label: 'Washington' }, { value: 'WI', label: 'Wisconsin' },
      { value: 'other', label: 'Other state' },
    ],
  },
];

interface GuidanceResult {
  category: string;
  headline: string;
  summary: string;
  discussTopics: string[];
  warnings: string[];
}

export default function QuizPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<GuidanceResult | null>(null);
  const [loading, setLoading] = useState(false);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep) / steps.length) * 100;

  async function handleSelect(value: string) {
    const newAnswers = { ...answers, [step.id]: value };
    setAnswers(newAnswers);

    if (isLastStep) {
      setLoading(true);
      try {
        const res = await fetch('/api/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAnswers),
        });
        const data = await res.json();
        setResult(data);
      } catch {
        setResult({
          category: 'General Education',
          headline: 'Please consult a licensed clinician.',
          summary: 'Always work with a licensed medical provider before pursuing any peptide therapy.',
          discussTopics: ['Your health goals', 'Your medical history', 'Available evidence-based options'],
          warnings: ['Never purchase peptides without a prescription.', 'This site does not provide medical advice.'],
        });
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-4xl mb-4">🔍</div>
        <h2>Generating your guidance...</h2>
        <p className="text-gray-500 mt-2">This will only take a moment.</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="inline-block bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            ✓ Quiz Complete
          </div>
          <h1 className="mb-2">Your Educational Guidance</h1>
          <p className="text-gray-500">
            Based on your answers, here is relevant educational information and questions to discuss with a clinician.
          </p>
        </div>

        <div className="disclaimer-box mb-6">
          <strong>⚠ Important:</strong> This is educational guidance only — not a treatment plan, diagnosis, or medical recommendation.
          The information below is intended to help you have a more informed conversation with a licensed clinician.
        </div>

        <div className="card p-6 mb-6">
          <div className="text-sm font-medium text-brand-600 mb-1">{result.category}</div>
          <h2 className="text-gray-900 mb-3">{result.headline}</h2>
          <p className="text-gray-600 leading-relaxed">{result.summary}</p>
        </div>

        <div className="card p-6 mb-6">
          <h3 className="mb-4 text-gray-900">Topics to Discuss With Your Clinician</h3>
          <ul className="space-y-2">
            {result.discussTopics.map((topic, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-brand-500 shrink-0 mt-0.5">→</span>
                <span>{topic}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
          <h3 className="text-red-800 mb-3">Important Safety Reminders</h3>
          <ul className="space-y-2">
            {result.warnings.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                <span className="shrink-0 mt-0.5">⚠</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center space-y-4">
          <h3 className="text-gray-900">Ready to find a verified provider?</h3>
          <p className="text-gray-500 text-sm">
            Search our directory of license-verified clinics and telehealth providers in your area.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/providers?state=${answers.location || ''}&telehealth=${answers.care_type === 'telehealth' ? '1' : ''}`}
              className="btn-primary px-8"
            >
              Find Providers Near You
            </Link>
            <button
              onClick={() => { setResult(null); setCurrentStep(0); setAnswers({}); }}
              className="btn-secondary px-8"
            >
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="mb-2">Safety & Guidance Quiz</h1>
        <p className="text-gray-500">
          Answer a few questions to receive safe educational guidance and find relevant providers.
        </p>
      </div>

      <div className="disclaimer-box mb-6 text-sm">
        <strong>Note:</strong> This quiz is for educational purposes only. Your answers are used to provide general educational
        guidance — not medical advice. Sensitive health information entered here is not stored.
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Question {currentStep + 1} of {steps.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-brand-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="card p-6">
        <h2 className="text-gray-900 mb-1">{step.question}</h2>
        {step.note && <p className="text-sm text-gray-500 mb-5">{step.note}</p>}
        {!step.note && <div className="mb-5" />}

        <div className={`space-y-2 ${step.options.length > 8 ? 'grid sm:grid-cols-2 gap-2 space-y-0' : ''}`}>
          {step.options.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-brand-400 hover:bg-brand-50 transition-colors flex items-center gap-3 group"
            >
              {opt.icon && <span className="text-xl shrink-0">{opt.icon}</span>}
              <span className="text-sm font-medium text-gray-700 group-hover:text-brand-700">
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {currentStep > 0 && (
        <button
          onClick={() => setCurrentStep(prev => prev - 1)}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          ← Back
        </button>
      )}
    </div>
  );
}
