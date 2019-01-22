import { fk, many, attr, Model } from 'redux-orm';

class Story extends Model {
  toString() {
    return `Story: ${this.name}`;
  }
}

Story.modelName = 'Story';

Story.fields = {
  id: attr(),
  user_id: fk('User', 'stories'), // 2nd arg `stories` because get stories from `user.stories`
  bookmarked_by_me: attr(),
  category_id: fk('Category', 'stories'),
  collaborators: many('User', 'collaborations'),
  comments_count: attr(),
  created_at: attr(),
  deleted_at: attr(),
  draft: attr(),
  fb_share: attr(),
  feed_sort: attr(),
  fired_by_me: attr(),
  fires_count: attr(),
  is_picked: attr(),
  is_video: attr(),
  locale: attr(),
  location_id: attr(),
  location_name: attr(),
  main_content_id: attr(),
  picked_at: attr(),
  sort: attr(),
  story_location: attr(),
  thumbnail_url: attr(),
  title: attr(),
  updated_at: attr(),
  url: attr(),
  video_url: attr(),
};
