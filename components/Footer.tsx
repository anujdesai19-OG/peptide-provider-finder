import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <span>🔬</span>
              <span>Peptide Provider Finder</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              A provider-finder and education directory for consumers researching legitimate medical providers
              who may offer peptide therapy consultations.
            </p>
            <div className="mt-4 p-3 bg-gray-800 rounded-lg text-xs text-amber-400 border border-amber-900">
              <strong>Educational directory only.</strong> Not medical advice. Not a pharmacy. Not a peptide seller.
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/education" className="hover:text-white transition-colors">Peptide Education</Link></li>
              <li><Link href="/quiz" className="hover:text-white transition-colors">Safety Quiz</Link></li>
              <li><Link href="/providers" className="hover:text-white transition-colors">Provider Directory</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Providers & Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/apply" className="hover:text-white transition-colors">Apply for Listing</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Report a Listing</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Peptide Provider Finder. All rights reserved.</p>
          <p className="text-center">
            This site does not sell peptides, provide medical advice, or prescribe medications.
            Always consult a licensed clinician.
          </p>
        </div>
      </div>
    </footer>
  );
}
