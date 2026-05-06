'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ContactForm() {
  const searchParams = useSearchParams();
  const providerId = searchParams.get('provider_id') || '';
  const providerName = searchParams.get('provider_name') || '';

  const [form, setForm] = useState({
    email: '',
    reason: providerId ? 'inaccurate_info' : 'general',
    details: '',
    provider_id: providerId,
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isReport = !!providerId;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.details || !form.reason) { setError('Please fill in all required fields.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Submission failed. Please try again.');
      } else {
        setSubmitted(true);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="mb-2">Message Received</h2>
        <p className="text-gray-600">
          {isReport
            ? 'Thank you for your report. Our team will review the listing and take appropriate action.'
            : 'Thank you for contacting us. We will respond as soon as possible.'}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6">
      {isReport && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-800">
          <strong>Reporting:</strong> {decodeURIComponent(providerName)}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="form-label">Your Email (optional)</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
            className="form-input"
            placeholder="For follow-up if needed"
          />
        </div>

        <div>
          <label className="form-label">Reason <span className="text-red-500">*</span></label>
          <select
            value={form.reason}
            onChange={e => setForm(prev => ({ ...prev, reason: e.target.value }))}
            className="form-input"
            required
          >
            {isReport ? (
              <>
                <option value="inaccurate_info">Inaccurate information</option>
                <option value="unlicensed">Provider may not be licensed</option>
                <option value="selling_peptides">Provider appears to sell peptides directly</option>
                <option value="unsafe_claims">Unsafe or misleading medical claims</option>
                <option value="no_longer_operating">Practice no longer operating</option>
                <option value="other">Other concern</option>
              </>
            ) : (
              <>
                <option value="general">General question</option>
                <option value="provider_inquiry">Provider listing inquiry</option>
                <option value="technical">Technical issue</option>
                <option value="other">Other</option>
              </>
            )}
          </select>
        </div>

        <div>
          <label className="form-label">
            {isReport ? 'Details of your concern' : 'Message'} <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.details}
            onChange={e => setForm(prev => ({ ...prev, details: e.target.value }))}
            rows={5}
            className="form-input"
            required
            placeholder={isReport ? 'Please describe your concern in as much detail as possible...' : 'How can we help?'}
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full mt-6">
        {loading ? 'Submitting...' : isReport ? 'Submit Report' : 'Send Message'}
      </button>
    </form>
  );
}

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2">Contact Us / Report a Listing</h1>
        <p className="text-gray-600">
          Use this form to send us a message or to report a provider listing that appears inaccurate, unsafe, or suspicious.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {[
          { icon: '🚩', title: 'Report a Listing', desc: 'Flag inaccurate, unsafe, or suspicious provider information.' },
          { icon: '💬', title: 'General Contact', desc: 'Questions, feedback, or partnership inquiries.' },
        ].map(item => (
          <div key={item.title} className="card p-4 flex items-start gap-3">
            <span className="text-2xl">{item.icon}</span>
            <div>
              <p className="font-medium text-gray-900 text-sm">{item.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <Suspense fallback={<div className="card p-6 text-center text-gray-400">Loading form...</div>}>
        <ContactForm />
      </Suspense>

      <div className="mt-8 text-center text-xs text-gray-400">
        Reports are reviewed by our admin team and do not result in automatic removal.
        We take all concerns seriously and investigate each report.
      </div>
    </div>
  );
}
