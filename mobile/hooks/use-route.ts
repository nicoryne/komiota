import { useState, useEffect } from 'react';
import { Q } from '@nozbe/watermelondb';
import { database } from '../db';
import Route from '../db/models/route';
import RouteStop from '../db/models/route-stop';
import BusStop from '../db/models/bus-stop';

interface RouteWithStops {
  route: Route | null;
  stops: { routeStop: RouteStop; busStop: BusStop }[];
  isLoading: boolean;
}

/**
 * Observes a single route by ID with its ordered stops from WatermelonDB.
 */
export function useRoute(routeId: string | undefined): RouteWithStops {
  const [route, setRoute] = useState<Route | null>(null);
  const [stops, setStops] = useState<{ routeStop: RouteStop; busStop: BusStop }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!routeId) {
      setIsLoading(false);
      return;
    }

    // Observe route
    const routeSub = database
      .get<Route>('routes')
      .findAndObserve(routeId)
      .subscribe((r) => setRoute(r));

    // Observe route's stops ordered by order_index
    const stopsSub = database
      .get<RouteStop>('route_stops')
      .query(Q.where('route_id', routeId), Q.sortBy('order_index', Q.asc))
      .observe()
      .subscribe(async (routeStops) => {
        const withBusStops = await Promise.all(
          routeStops.map(async (rs) => {
            const busStop = await rs.busStop.fetch();
            return { routeStop: rs, busStop };
          }),
        );
        setStops(withBusStops);
        setIsLoading(false);
      });

    return () => {
      routeSub.unsubscribe();
      stopsSub.unsubscribe();
    };
  }, [routeId]);

  return { route, stops, isLoading };
}
