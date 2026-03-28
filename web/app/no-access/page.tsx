import Link from 'next/link';
import { ShieldOff } from 'lucide-react';

export default function NoAccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F4F1] px-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-8 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-[20px] bg-[#402859]/10">
          <ShieldOff className="w-8 h-8 text-[#402859]" />
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-bold text-[#402859] tracking-tight">
            Access Restricted
          </h1>
          <p className="text-sm text-[#402859]/60 leading-relaxed">
            You don&apos;t have the required permissions to access the dashboard.
            Only administrators and moderators are allowed.
          </p>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#402859] text-white text-sm font-semibold hover:bg-[#321f4a] transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
