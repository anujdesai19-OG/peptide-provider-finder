import Link from 'next/link';
import { Provider } from '@/lib/types';

interface Props {
  provider: Provider;
}

export default function ProviderCard({ provider }: Props) {
  const services = provider.services_offered?.split(',').map(s => s.trim()).filter(Boolean) || [];
  const statesServed = provider.states_served?.split(',').map(s => s.trim()).filter(Boolean) || [];

  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-base leading-tight">
            {provider.business_name}
          </h3>
          {provider.clinician_name && (
            <p className="text-sm text-gray-500 mt-0.5">{provider.clinician_name}</p>
          )}
        </div>
        <span className="badge-approved shrink-0">✓ Verified</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="px-2 py-0.5 bg-brand-50 text-brand-700 rounded text-xs font-medium">
          {provider.provider_type}
        </span>
        {provider.telehealth_available ? (
          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-medium">
            Telehealth Available
          </span>
        ) : null}
        {provider.city && provider.state && (
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
            📍 {provider.city}, {provider.state}
          </span>
        )}
      </div>

      {services.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {services.slice(0, 3).map(s => (
            <span key={s} className="px-2 py-0.5 bg-gray-50 text-gray-600 border border-gray-200 rounded text-xs">
              {s}
            </span>
          ))}
          {services.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-50 text-gray-500 border border-gray-200 rounded text-xs">
              +{services.length - 3} more
            </span>
          )}
        </div>
      )}

      {statesServed.length > 0 && (
        <p className="text-xs text-gray-500 mb-3">
          Serves: {statesServed.slice(0, 5).join(', ')}
          {statesServed.length > 5 ? ` +${statesServed.length - 5} more` : ''}
        </p>
      )}

      {provider.verification_date && (
        <p className="text-xs text-gray-400 mb-3">
          Verification last reviewed: {new Date(provider.verification_date).toLocaleDateString()}
        </p>
      )}

      <Link
        href={`/providers/${provider.id}`}
        className="block text-center text-sm font-medium text-brand-600 border border-brand-200 rounded-lg py-2 hover:bg-brand-50 transition-colors"
      >
        View Profile →
      </Link>
    </div>
  );
}
