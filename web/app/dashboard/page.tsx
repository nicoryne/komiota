import { BusStopService } from '@/services/bus-stop';
import { RouteService } from '@/services/route';
import { AccountService } from '@/services/account';
import { StatCard } from '@/components/dashboard/stat-card';
import { MapPin, Route, Users, Clock } from 'lucide-react';

export default async function DashboardOverview() {
  // Fetch all stats in parallel
  const [statusCountsResult, routeCountResult, userCountResult, pendingStopsResult] =
    await Promise.all([
      BusStopService.getStatusCounts(),
      RouteService.getTotalCount(),
      AccountService.getTotalCount(),
      BusStopService.list({
        page: 1,
        pageSize: 5,
        filters: { status: 'pending' },
        sortBy: 'created_at',
        sortOrder: 'desc',
      }),
    ]);

  const statusCounts = statusCountsResult.success ? statusCountsResult.data : null;
  const totalRoutes = routeCountResult.success ? routeCountResult.data : 0;
  const totalUsers = userCountResult.success ? userCountResult.data : 0;
  const pendingStops = pendingStopsResult.success ? pendingStopsResult.data.data : [];

  const totalStops = statusCounts
    ? statusCounts.pending + statusCounts.approved + statusCounts.rejected
    : 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1C1A22]">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Welcome to the Komiota management dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Bus Stops" value={totalStops} icon={MapPin} />
        <StatCard
          label="Pending Submissions"
          value={statusCounts?.pending ?? 0}
          icon={Clock}
        />
        <StatCard label="Total Routes" value={totalRoutes} icon={Route} />
        <StatCard label="Total Users" value={totalUsers} icon={Users} />
      </div>

      {/* Recent Pending Stops */}
      <div className="bg-white rounded-[16px] border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-[#1C1A22] mb-4">
          Recent Pending Submissions
        </h2>

        {pendingStops.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No pending submissions.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingStops.map((stop) => (
              <div
                key={stop.id}
                className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-[12px] hover:bg-gray-100 transition-colors"
              >
                <div className="flex flex-col gap-1">
                  <p className="font-medium text-[#1C1A22]">{stop.name}</p>
                  <p className="text-sm text-gray-600">
                    Submitted {new Date(stop.created_at!).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={`/dashboard/bus-stops/${stop.id}`}
                  className="text-sm text-[#4627b6] hover:underline font-medium"
                >
                  Review →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
