import { useState, useEffect } from 'react';
import { database } from '../db';
import Route from '../db/models/route';

/**
 * Observes all routes from the local WatermelonDB for reactive offline rendering.
 */
export function useRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);

  useEffect(() => {
    const subscription = database
      .get<Route>('routes')
      .query()
      .observe()
      .subscribe((data) => setRoutes(data));

    return () => subscription.unsubscribe();
  }, []);

  return routes;
}
