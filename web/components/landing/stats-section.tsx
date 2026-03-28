import { CheckCircle, Route, UserCheck } from 'lucide-react';

interface StatsSectionProps {
  verifiedStops: number | null;
  totalRoutes: number | null;
  totalUsers: number | null;
}

const statConfig = [
  {
    key: 'verifiedStops' as const,
    label: 'Verified Bus Stops',
    icon: CheckCircle,
  },
  {
    key: 'totalRoutes' as const,
    label: 'Transit Routes',
    icon: Route,
  },
  {
    key: 'totalUsers' as const,
    label: 'Registered Users',
    icon: UserCheck,
  },
];

export function StatsSection({ verifiedStops, totalRoutes, totalUsers }: StatsSectionProps) {
  const values = { verifiedStops, totalRoutes, totalUsers };

  return (
    <section className="w-full bg-[#4627b6] px-6 py-14">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Powered by the Community
          </h2>
          <p className="text-white/70 text-sm">
            Live stats from the Komiota network
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
          {statConfig.map(({ key, label, icon: Icon }) => {
            const value = values[key];
            return (
              <div
                key={key}
                className="flex flex-col items-center gap-3 p-6 bg-white/10 rounded-[16px] border border-white/20"
              >
                <Icon className="w-6 h-6 text-white/80" />
                <span
                  className="text-4xl font-extrabold text-white"
                  data-stat={key}
                >
                  {value === null ? '—' : value.toLocaleString()}
                </span>
                <span className="text-sm text-white/70 text-center">{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
