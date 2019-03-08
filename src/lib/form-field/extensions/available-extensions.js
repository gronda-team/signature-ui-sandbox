import { TextAreaAutosize } from '../../../cdk/text-area';
import AutocompleteExtension from '../../autocomplete/extensions/AutocompleteExtension';
import TagListExtension from '../../tags/extensions/TagListExtension';

export let availableExtensions = [
  {
    name: '##datepicker',
    type: ['input'],
  },
  {
    name: '##tag-list',
    type: ['input'],
    component: TagListExtension,
  },
  {
    name: '##autosize',
    type: ['textarea'],
    component: TextAreaAutosize,
  },
  {
    name: '##autocomplete',
    type: ['input', 'textarea'],
    component: AutocompleteExtension,
  },
];

export function addExtension(...extensions) {
  availableExtensions = availableExtensions.concat(extensions);
}
