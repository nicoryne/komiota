import { NavHeader } from '@/components/landing/nav-header';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { StatsSection } from '@/components/landing/stats-section';
import { BusStopService } from '@/services/bus-stop';
import { RouteService } from '@/services/route';
import { AccountService } from '@/services/account';

async function fetchStats() {
  let verifiedStops: number | null = null;
  let totalRoutes: number | null = null;
  let totalUsers: number | null = null;

  // Fetch approved bus stops count through service layer
  const stopsResult = await BusStopService.getApprovedCount();
  if (stopsResult.success) {
    verifiedStops = stopsResult.data;
  }

  // Fetch total routes count through service layer
  const routesResult = await RouteService.getTotalCount();
  if (routesResult.success) {
    totalRoutes = routesResult.data;
  }

  // Fetch total users count through service layer
  const usersResult = await AccountService.getTotalCount();
  if (usersResult.success) {
    totalUsers = usersResult.data;
  }

  return { verifiedStops, totalRoutes, totalUsers };
}

export default async function Home() {
  const { verifiedStops, totalRoutes, totalUsers } = await fetchStats();

  return (
    <div className="flex flex-col min-h-screen">
      <NavHeader />
      <main className="flex flex-col flex-1">
        <HeroSection />
        <FeaturesSection />
        <StatsSection
          verifiedStops={verifiedStops}
          totalRoutes={totalRoutes}
          totalUsers={totalUsers}
        />
      </main>
    </div>
  );
}
