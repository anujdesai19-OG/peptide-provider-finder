'use client';
import { useState } from 'react';

const PROVIDER_TYPES = ['Medical Clinic', 'Telehealth Provider', 'Integrative Medicine', 'Anti-Aging Clinic', 'Licensed Compounding Pharmacy', 'Other'];
const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];
const SERVICES_OPTIONS = ['Weight Management','Metabolic Health','Recovery','Hormone Optimization','Sleep Support','Wellness','Performance','Other'];

interface FormData {
  business_name: string;
  clinician_name: string;
  provider_type: string;
  license_number: string;
  license_state: string;
  npi: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  website: string;
  booking_url: string;
  telehealth_available: boolean;
  states_served: string[];
  services_offered: string[];
  lab_requirement_summary: string;
  pharmacy_model: string;
  public_profile_description: string;
  verification_docs: string;
  agree_terms: boolean;
}

const initial: FormData = {
  business_name: '', clinician_name: '', provider_type: '', license_number: '',
  license_state: '', npi: '', address: '', city: '', state: '', zip: '',
  phone: '', email: '', website: '', booking_url: '',
  telehealth_available: false, states_served: [], services_offered: [],
  lab_requirement_summary: '', pharmacy_model: '', public_profile_description: '',
  verification_docs: '', agree_terms: false,
};

export default function ApplyPage() {
  const [form, setForm] = useState<FormData>(initial);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(field: keyof FormData, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function toggleArray(field: 'states_served' | 'services_offered', value: string) {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.agree_terms) { setError('You must agree to the terms to submit.'); return; }
    if (!form.business_name || !form.license_number || !form.license_state || !form.email || !form.provider_type) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          states_served: form.states_served.join(','),
          services_offered: form.services_offered.join(','),
        }),
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
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-6">✅</div>
        <h1 className="mb-3">Application Submitted</h1>
        <p className="text-gray-600 mb-6">
          Thank you for submitting your application. Our team will review your license information and contact you within 3–5 business days.
          New listings are not published until approved by an administrator.
        </p>
        <p className="text-sm text-gray-500">
          Questions? Contact us at <a href="/contact" className="text-brand-600 hover:underline">our contact page</a>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="mb-2">Apply for a Provider Listing</h1>
        <p className="text-gray-600">
          Licensed medical providers, clinics, and pharmacies may apply to be listed in our verified directory.
          All applications are reviewed manually before publication.
        </p>
      </div>

      <div className="disclaimer-box mb-6">
        <strong>Eligibility:</strong> Only licensed medical providers operating in compliance with state and federal law may apply.
        We do not list research-chemical sellers, supplement shops, or non-prescription injectable vendors.
        Submitting false information may result in permanent ineligibility.
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Business Info */}
        <div className="card p-6">
          <h2 className="mb-4 text-gray-900">Business Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="form-label">Business / Practice Name <span className="text-red-500">*</span></label>
              <input value={form.business_name} onChange={e => set('business_name', e.target.value)} className="form-input" required />
            </div>
            <div>
              <label className="form-label">Clinician Name (if applicable)</label>
              <input value={form.clinician_name} onChange={e => set('clinician_name', e.target.value)} className="form-input" />
            </div>
            <div>
              <label className="form-label">Provider Type <span className="text-red-500">*</span></label>
              <select value={form.provider_type} onChange={e => set('provider_type', e.target.value)} className="form-input" required>
                <option value="">Select type...</option>
                {PROVIDER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Address</label>
              <input value={form.address} onChange={e => set('address', e.target.value)} className="form-input" />
            </div>
            <div>
              <label className="form-label">City</label>
              <input value={form.city} onChange={e => set('city', e.target.value)} className="form-input" />
            </div>
            <div>
              <label className="form-label">State</label>
              <select value={form.state} onChange={e => set('state', e.target.value)} className="form-input">
                <option value="">Select state...</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">ZIP</label>
              <input value={form.zip} onChange={e => set('zip', e.target.value)} className="form-input" maxLength={10} />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className="form-input" />
            </div>
            <div>
              <label className="form-label">Email <span className="text-red-500">*</span></label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="form-input" required />
            </div>
            <div>
              <label className="form-label">Website</label>
              <input type="url" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://" className="form-input" />
            </div>
            <div>
              <label className="form-label">Booking URL</label>
              <input type="url" value={form.booking_url} onChange={e => set('booking_url', e.target.value)} placeholder="https://" className="form-input" />
            </div>
          </div>
        </div>

        {/* License Info */}
        <div className="card p-6">
          <h2 className="mb-4 text-gray-900">License & Verification</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">License Number <span className="text-red-500">*</span></label>
              <input value={form.license_number} onChange={e => set('license_number', e.target.value)} className="form-input" required />
            </div>
            <div>
              <label className="form-label">License State <span className="text-red-500">*</span></label>
              <select value={form.license_state} onChange={e => set('license_state', e.target.value)} className="form-input" required>
                <option value="">Select state...</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">NPI Number (if applicable)</label>
              <input value={form.npi} onChange={e => set('npi', e.target.value)} className="form-input" maxLength={10} />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Verification Documents / Links</label>
              <textarea
                value={form.verification_docs}
                onChange={e => set('verification_docs', e.target.value)}
                rows={2}
                className="form-input"
                placeholder="Links to state medical board verification, NPI lookup, or other verification resources..."
              />
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="card p-6">
          <h2 className="mb-4 text-gray-900">Services & Coverage</h2>

          <div className="mb-4">
            <label className="form-label">Services Offered</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
              {SERVICES_OPTIONS.map(s => (
                <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.services_offered.includes(s)}
                    onChange={() => toggleArray('services_offered', s)}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.telehealth_available}
                onChange={e => set('telehealth_available', e.target.checked)}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              Telehealth consultations available
            </label>
          </div>

          {form.telehealth_available && (
            <div className="mb-4">
              <label className="form-label">States Served via Telehealth</label>
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-1 mt-1 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                {US_STATES.map(s => (
                  <label key={s} className="flex items-center gap-1 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.states_served.includes(s)}
                      onChange={() => toggleArray('states_served', s)}
                      className="rounded border-gray-300 text-brand-600"
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Lab Requirement Summary</label>
              <textarea
                value={form.lab_requirement_summary}
                onChange={e => set('lab_requirement_summary', e.target.value)}
                rows={3}
                className="form-input"
                placeholder="Describe what labs patients need before starting therapy..."
              />
            </div>
            <div>
              <label className="form-label">Pharmacy Model</label>
              <textarea
                value={form.pharmacy_model}
                onChange={e => set('pharmacy_model', e.target.value)}
                rows={3}
                className="form-input"
                placeholder="Describe how patients obtain prescriptions/medications..."
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="form-label">Public Profile Description</label>
            <textarea
              value={form.public_profile_description}
              onChange={e => set('public_profile_description', e.target.value)}
              rows={4}
              className="form-input"
              placeholder="A brief description of your practice that will appear on your public profile..."
              maxLength={1000}
            />
            <p className="text-xs text-gray-400 mt-1">{form.public_profile_description.length}/1000 characters</p>
          </div>
        </div>

        {/* Agreement */}
        <div className="card p-6 bg-gray-50">
          <h2 className="mb-3 text-gray-900">Agreement & Certification</h2>
          <div className="text-sm text-gray-600 space-y-2 mb-4">
            <p>By submitting this application, you certify that:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>All information provided is accurate and complete to the best of your knowledge.</li>
              <li>Your practice holds all required licenses and operates in compliance with applicable state and federal law.</li>
              <li>You will notify us promptly of any changes to license status, disciplinary actions, or practice information.</li>
              <li>You understand that listings are subject to removal if information is found to be inaccurate or if compliance concerns arise.</li>
            </ul>
          </div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.agree_terms}
              onChange={e => set('agree_terms', e.target.checked)}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 mt-0.5"
            />
            <span className="text-sm text-gray-700">
              I certify that all information is accurate and I agree to the listing terms above. <span className="text-red-500">*</span>
            </span>
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Submitting...' : 'Submit Application for Review'}
        </button>
      </form>
    </div>
  );
}
