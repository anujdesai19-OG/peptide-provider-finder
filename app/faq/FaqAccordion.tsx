'use client';
import { useState } from 'react';
import { FaqItem } from '@/lib/types';

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.id} className="card">
          <button
            onClick={() => setOpen(open === item.id ? null : item.id)}
            className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 hover:bg-gray-50 rounded-xl transition-colors"
            aria-expanded={open === item.id}
          >
            <span className="font-medium text-gray-900 text-sm">{item.question}</span>
            <svg
              className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${open === item.id ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {open === item.id && (
            <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
