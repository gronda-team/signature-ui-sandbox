import { fk, attr, Model } from 'redux-orm';

class StoryTopic extends Model {
  toString() {
    return `StoryTopic: ${this.title}`;
  }
}

StoryTopic.modelName = 'StoryTopic';

StoryTopic.fields = {
  id: attr(),
  created_at: attr(),
  description: attr(),
  media_url: attr(),
  sid: attr(),
  stories: fk('Story'),
  title: attr(),
  updated_at: attr(),
  value: attr(),
};
