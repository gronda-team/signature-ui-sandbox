import { fk, attr, Model } from 'redux-orm';

class StoryContent extends Model {
  toString() {
    return `StoryContent: ${this.id}`;
  }
}

StoryContent.modelName = 'StoryContent';

StoryContent.fields = {
  id: attr(),
  created_at: attr(),
  is_video: attr(),
  media_url: attr(),
  story: fk('Story', 'content'),
  text: attr(),
  updated_at: attr(),
  video_url: attr(),
};
