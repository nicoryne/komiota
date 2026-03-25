import { Model } from '@nozbe/watermelondb';
import { field, relation } from '@nozbe/watermelondb/decorators';

export default class RouteStop extends Model {
  static table = 'route_stops';

  static associations = {
    routes: { type: 'belongs_to' as const, key: 'route_id' },
    bus_stops: { type: 'belongs_to' as const, key: 'stop_id' },
  };

  @field('order_index') orderIndex!: number;

  @relation('routes', 'route_id') route!: any;
  @relation('bus_stops', 'stop_id') busStop!: any;
}
