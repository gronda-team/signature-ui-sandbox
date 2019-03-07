import { TextAreaAutosize } from '../../../cdk/text-area';
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
    name: '##autofill',
    type: ['input', 'textarea'],
  },
  {
    name: '##autocomplete',
    type: ['input', 'textarea'],
  },
];

export function addExtension(...extensions) {
  availableExtensions = availableExtensions.concat(extensions);
}
