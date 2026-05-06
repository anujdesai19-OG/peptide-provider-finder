import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ensureDb, getPool } from '@/lib/db';
import { Provider } from '@/lib/types';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await ensureDb();
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT * FROM providers WHERE id = $1 AND verification_status = 'approved'`,
    [params.id]
  );
  const provider = rows[0] as Provider | undefined;
  if (!provider) return { title: 'Provider Not Found' };
  return {
    title: provider.business_name,
    description: provider.public_profile_description || `Verified provider listing for ${provider.business_name}.`,
  };
}

export default async function ProviderProfilePage({ params }: Props) {
  await ensureDb();
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT * FROM providers WHERE id = $1 AND verification_status = 'approved'`,
    [params.id]
  );
  const provider = rows[0] as Provider | undefined;

  if (!provider) notFound();

  const services = provider.services_offered?.split(',').map(s => s.trim()).filter(Boolean) || [];
  const statesServed = provider.states_served?.split(',').map(s => s.trim()).filter(Boolean) || [];

  const isExpiringSoon = provider.next_review_date
    ? new Date(provider.next_review_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    : false;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-6">
        <Link href="/providers" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
          ← Back to Directory
        </Link>
      </div>

      <div className="disclaimer-box mb-6">
        <strong>Educational directory only.</strong> This listing is provided for informational purposes. Always verify provider credentials through your state medical board before scheduling a consultation. This site does not endorse any specific provider.
      </div>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{provider.business_name}</h1>
              <span className="badge-approved">✓ Verified</span>
            </div>
            {provider.clinician_name && (
              <p className="text-gray-600">{provider.clinician_name}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-sm font-medium">
                {provider.provider_type}
              </span>
              {provider.telehealth_available ? (
                <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                  Telehealth Available
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            {provider.booking_url && (
              <a
                href={provider.booking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm"
              >
                Book Consultation
              </a>
            )}
            {provider.website && (
              <a
                href={provider.website}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-sm text-center"
              >
                Visit Website
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          {provider.public_profile_description && (
            <div className="card p-6">
              <h2 className="mb-3 text-gray-900">About This Practice</h2>
              <p className="text-gray-600 leading-relaxed">{provider.public_profile_description}</p>
            </div>
          )}

          {services.length > 0 && (
            <div className="card p-6">
              <h2 className="mb-3 text-gray-900">Services Offered</h2>
              <div className="flex flex-wrap gap-2">
                {services.map(s => (
                  <span key={s} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {provider.lab_requirement_summary && (
            <div className="card p-6">
              <h2 className="mb-3 text-gray-900">Lab Requirements</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{provider.lab_requirement_summary}</p>
              <div className="mt-3 text-xs text-gray-500 bg-gray-50 rounded p-2">
                Lab requirements listed here are provided by the practice and are for informational purposes. Your clinician will determine what testing is appropriate for you.
              </div>
            </div>
          )}

          {provider.pharmacy_model && (
            <div className="card p-6">
              <h2 className="mb-3 text-gray-900">Pharmacy Model</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{provider.pharmacy_model}</p>
            </div>
          )}

          {statesServed.length > 0 && (
            <div className="card p-6">
              <h2 className="mb-3 text-gray-900">States Served</h2>
              <div className="flex flex-wrap gap-1.5">
                {statesServed.map(s => (
                  <span key={s} className="px-2 py-0.5 bg-brand-50 text-brand-700 rounded text-sm font-medium">
                    {s}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Telehealth providers must hold a valid license in each state where they treat patients. Verify licensure for your state independently.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Verification */}
          <div className="card p-5">
            <h3 className="text-gray-900 mb-3">Verification Details</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-500">Status</dt>
                <dd className="font-medium text-green-700">✓ Approved</dd>
              </div>
              {provider.license_number && (
                <div>
                  <dt className="text-gray-500">License Number</dt>
                  <dd className="font-medium text-gray-800">{provider.license_number}</dd>
                </div>
              )}
              {provider.license_state && (
                <div>
                  <dt className="text-gray-500">License State</dt>
                  <dd className="font-medium text-gray-800">{provider.license_state}</dd>
                </div>
              )}
              {provider.npi && (
                <div>
                  <dt className="text-gray-500">NPI</dt>
                  <dd className="font-medium text-gray-800">{provider.npi}</dd>
                </div>
              )}
              {provider.verification_date && (
                <div>
                  <dt className="text-gray-500">Verification Last Reviewed</dt>
                  <dd className={`font-medium ${isExpiringSoon ? 'text-amber-700' : 'text-gray-800'}`}>
                    {new Date(provider.verification_date).toLocaleDateString()}
                    {isExpiringSoon && ' ⚠ Review due soon'}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Contact */}
          <div className="card p-5">
            <h3 className="text-gray-900 mb-3">Contact Information</h3>
            <dl className="space-y-2 text-sm">
              {provider.city && provider.state && (
                <div>
                  <dt className="text-gray-500">Location</dt>
                  <dd className="text-gray-800">{provider.city}, {provider.state} {provider.zip}</dd>
                </div>
              )}
              {provider.phone && (
                <div>
                  <dt className="text-gray-500">Phone</dt>
                  <dd><a href={`tel:${provider.phone}`} className="text-brand-600 hover:underline">{provider.phone}</a></dd>
                </div>
              )}
              {provider.email && (
                <div>
                  <dt className="text-gray-500">Email</dt>
                  <dd><a href={`mailto:${provider.email}`} className="text-brand-600 hover:underline break-all">{provider.email}</a></dd>
                </div>
              )}
              {provider.website && (
                <div>
                  <dt className="text-gray-500">Website</dt>
                  <dd>
                    <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline break-all">
                      {provider.website.replace(/^https?:\/\//, '')}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Report */}
          <div className="card p-5 bg-gray-50">
            <h3 className="text-gray-700 text-sm font-semibold mb-2">Concerned about this listing?</h3>
            <p className="text-xs text-gray-500 mb-3">
              If you believe this listing contains inaccurate, unsafe, or suspicious information, please report it.
            </p>
            <Link
              href={`/contact?provider_id=${provider.id}&provider_name=${encodeURIComponent(provider.business_name)}`}
              className="text-sm text-red-600 hover:underline font-medium"
            >
              🚩 Report this listing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
