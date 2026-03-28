import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
}

export function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 p-6 bg-[#FAFAFA] rounded-[16px] border border-gray-200">
      <div className="flex items-center justify-between">
        <Icon className="w-6 h-6 text-[#4627b6]" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-3xl font-bold text-[#1C1A22]">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        <span className="text-sm text-gray-600">{label}</span>
      </div>
    </div>
  );
}
