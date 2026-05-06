'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA',
  'ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK',
  'OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

const SERVICES = [
  'Weight Management','Metabolic Health','Recovery','Hormone Optimization',
  'Sleep Support','Wellness','Performance',
];

interface Props {
  providerTypes: string[];
  initialParams: Record<string, string | undefined>;
}

export default function ProviderSearch({ providerTypes, initialParams }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(initialParams.q || '');
  const [state, setState] = useState(initialParams.state || 'all');
  const [zip, setZip] = useState(initialParams.zip || '');
  const [type, setType] = useState(initialParams.type || 'all');
  const [service, setService] = useState(initialParams.service || 'all');
  const [telehealth, setTelehealth] = useState(initialParams.telehealth === '1');

  function buildUrl() {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (state && state !== 'all') params.set('state', state);
    if (zip) params.set('zip', zip);
    if (type && type !== 'all') params.set('type', type);
    if (service && service !== 'all') params.set('service', service);
    if (telehealth) params.set('telehealth', '1');
    const str = params.toString();
    return str ? `${pathname}?${str}` : pathname;
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(buildUrl());
  }

  function handleGeolocate() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
        );
        const data = await res.json();
        const stateCode = data.address?.state_code || data.address?.state;
        if (stateCode && stateCode.length === 2) setState(stateCode.toUpperCase());
        const zipCode = data.address?.postcode?.substring(0, 5);
        if (zipCode) setZip(zipCode);
      } catch {}
    });
  }

  return (
    <form onSubmit={handleSearch} className="card p-5">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="form-label">Search</label>
          <input
            type="text"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Provider name or city..."
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">State</label>
          <select value={state} onChange={e => setState(e.target.value)} className="form-input">
            <option value="all">All States</option>
            {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">ZIP Code</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={zip}
              onChange={e => setZip(e.target.value.replace(/\D/g, '').substring(0, 5))}
              placeholder="e.g. 90210"
              className="form-input"
              maxLength={5}
            />
            <button
              type="button"
              onClick={handleGeolocate}
              title="Use my location"
              className="btn-secondary px-3 py-2 text-sm shrink-0"
            >
              📍
            </button>
          </div>
        </div>
        <div>
          <label className="form-label">Provider Type</label>
          <select value={type} onChange={e => setType(e.target.value)} className="form-input">
            <option value="all">All Types</option>
            {providerTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-48">
          <select value={service} onChange={e => setService(e.target.value)} className="form-input text-sm">
            <option value="all">All Services</option>
            {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={telehealth}
            onChange={e => setTelehealth(e.target.checked)}
            className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          Telehealth available
        </label>

        <button type="submit" className="btn-primary">
          Search
        </button>

        <a href="/providers" className="text-sm text-gray-500 hover:text-gray-700">
          Clear filters
        </a>
      </div>
    </form>
  );
}
