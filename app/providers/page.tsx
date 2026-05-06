import type { Metadata } from 'next';
import { ensureDb, getPool } from '@/lib/db';
import { Provider } from '@/lib/types';
import ProviderCard from '@/components/ProviderCard';
import ProviderSearch from './ProviderSearch';

export const metadata: Metadata = {
  title: 'Provider Directory',
  description: 'Search our directory of verified, licensed medical providers and clinics offering peptide therapy consultations.',
};

interface SearchParams extends Record<string, string | undefined> {
  state?: string;
  zip?: string;
  type?: string;
  telehealth?: string;
  service?: string;
  q?: string;
}

export const dynamic = 'force-dynamic';

export default async function ProvidersPage({ searchParams }: { searchParams: SearchParams }) {
  await ensureDb();
  const pool = getPool();

  const params: (string | number)[] = [];
  function p(val: string | number): string {
    params.push(val);
    return `$${params.length}`;
  }

  let query = `SELECT * FROM providers WHERE verification_status = 'approved'`;

  if (searchParams.state && searchParams.state !== 'all') {
    const s = searchParams.state;
    query += ` AND (state = ${p(s)} OR states_served LIKE ${p(`%${s}%`)})`;
  }

  if (searchParams.telehealth === '1') {
    query += ` AND telehealth_available = 1`;
  }

  if (searchParams.type && searchParams.type !== 'all') {
    query += ` AND provider_type = ${p(searchParams.type)}`;
  }

  if (searchParams.service && searchParams.service !== 'all') {
    query += ` AND services_offered LIKE ${p(`%${searchParams.service}%`)}`;
  }

  if (searchParams.q) {
    const term = `%${searchParams.q}%`;
    query += ` AND (business_name ILIKE ${p(term)} OR clinician_name ILIKE ${p(term)} OR city ILIKE ${p(term)})`;
  }

  if (searchParams.zip) {
    query += ` AND zip LIKE ${p(`${searchParams.zip.substring(0, 3)}%`)}`;
  }

  query += ` ORDER BY verification_date DESC`;

  const { rows: providers } = await pool.query(query, params);

  const { rows: typeRows } = await pool.query(
    `SELECT DISTINCT provider_type FROM providers WHERE verification_status = 'approved' ORDER BY provider_type`
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2">Verified Provider Directory</h1>
        <p className="text-gray-600">
          Browse licensed medical providers, clinics, and telehealth practices. All listings have submitted license information for review.
        </p>
        <div className="disclaimer-box mt-4 text-sm">
          <strong>Reminder:</strong> Verification dates indicate when license information was last reviewed. Always verify provider credentials independently through your state medical board before scheduling a consultation.
        </div>
      </div>

      <ProviderSearch
        providerTypes={typeRows.map((t: { provider_type: string }) => t.provider_type)}
        initialParams={searchParams}
      />

      <div className="mt-6">
        <p className="text-sm text-gray-500 mb-4">
          Showing <strong>{providers.length}</strong> verified provider{providers.length !== 1 ? 's' : ''}
          {searchParams.state && searchParams.state !== 'all' ? ` in ${searchParams.state}` : ''}
        </p>

        {providers.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-gray-700 mb-2">No providers found</h3>
            <p className="text-gray-500 text-sm mb-4">Try adjusting your filters or searching a different state.</p>
            <a href="/providers" className="text-brand-600 text-sm hover:underline">Clear all filters</a>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(providers as Provider[]).map(prov => (
              <ProviderCard key={prov.id} provider={prov} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-12 card p-6 bg-brand-50 border-brand-100 text-center">
        <h3 className="mb-2">Are you a licensed provider?</h3>
        <p className="text-sm text-gray-600 mb-4">
          Submit your practice information for review to be listed in our directory.
        </p>
        <a href="/apply" className="btn-primary">Apply for a Listing</a>
      </div>
    </div>
  );
}
