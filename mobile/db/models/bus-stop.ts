import { Model } from '@nozbe/watermelondb';
import { text, field, children } from '@nozbe/watermelondb/decorators';

export default class BusStop extends Model {
  static table = 'bus_stops';

  static associations = {
    route_stops: { type: 'has_many' as const, foreignKey: 'stop_id' },
  };

  @text('name') name!: string;
  @field('latitude') latitude!: number;
  @field('longitude') longitude!: number;
  @text('status') status!: string;
  @text('image_url') imageUrl!: string | null;
  @text('created_by') createdBy!: string | null;

  @children('route_stops') routeStops!: any;
}
