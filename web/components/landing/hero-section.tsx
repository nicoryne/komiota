import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="w-full bg-[#FCFAFF] px-6 py-20 flex flex-col items-center text-center gap-8">
      <div className="flex flex-col items-center gap-4 max-w-2xl">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#4627b6]/10 text-[#4627b6] text-xs font-semibold uppercase tracking-wider">
          Cebu Bus Rapid Transit
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1C1A22] leading-tight tracking-tight">
          Navigate Cebu City{' '}
          <span className="text-[#4627b6]">Together</span>
        </h1>
        <p className="text-lg text-[#1C1A22]/70 max-w-xl leading-relaxed">
          Komiota is the community-powered map for the CBRT network. Find stops, plan routes,
          and help fellow commuters — even offline.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="https://apps.apple.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#4627b6] text-white font-semibold text-sm hover:bg-[#3a1fa0] transition-colors"
        >
          Download on App Store
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="https://play.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-[#4627b6] text-[#4627b6] font-semibold text-sm hover:bg-[#4627b6]/5 transition-colors"
        >
          Get it on Google Play
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
