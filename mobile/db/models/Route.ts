import { Model } from '@nozbe/watermelondb';
import { text, field, children } from '@nozbe/watermelondb/decorators';

export default class Route extends Model {
  static table = 'routes';

  static associations = {
    route_stops: { type: 'has_many' as const, foreignKey: 'route_id' },
  };

  @text('name') name!: string;
  @text('description') description!: string | null;
  @field('point_multiplier') pointMultiplier!: number;

  @children('route_stops') routeStops!: any;
}
