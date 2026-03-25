import { Model } from '@nozbe/watermelondb';
import { text } from '@nozbe/watermelondb/decorators';

export default class UserBookmark extends Model {
  static table = 'user_bookmarks';

  @text('profile_id') profileId!: string;
  @text('target_type') targetType!: string;
  @text('target_id') targetId!: string;
}
