import { UI_ACTION_TYPES } from '../FormField/states';

export default function onRequire() {
  if (!!this.transition && !!this.FORM_FIELD_OUTLINE.current) {
    const setAsRequired = !!this.FORM_FIELD_OUTLINE.current.querySelector('[aria-required=true]');
    this.transition(setAsRequired ? UI_ACTION_TYPES.REQUIRE : UI_ACTION_TYPES.UNREQUIRE);
  }
};
