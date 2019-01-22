import { fk, many, attr, Model } from 'redux-orm';

class Category extends Model {
  toString() {
    return `Category: ${this.value}`;
  }
}

Category.modelName = 'Story';

Category.fields = {
  id: attr(),
  created_at: attr(),
  deleted_at: attr(),
  description: attr(),
  end_at: attr(),
  featured_story_id: attr(),
  is_active: attr(),
  is_selectable: attr(),
  is_special: attr(),
  locale: attr(),
  media_url: attr(),
  updated_at: attr(),
  value: attr(),
};

export default Category;
