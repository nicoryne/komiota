import Link from 'next/link';
import { Bus } from 'lucide-react';

export function NavHeader() {
  return (
    <header className="w-full px-6 py-4 flex items-center justify-between bg-[#FCFAFF] border-b border-[#4627b6]/10">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#4627b6]">
          <Bus className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-lg font-bold text-[#1C1A22] tracking-tight">Komiota</span>
          <span className="text-xs text-[#4627b6] font-medium">Navigate Cebu Together</span>
        </div>
      </div>
      <Link
        href="/login"
        className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-[#4627b6] text-white text-sm font-semibold hover:bg-[#3a1fa0] transition-colors"
      >
        Dashboard Login
      </Link>
    </header>
  );
}
