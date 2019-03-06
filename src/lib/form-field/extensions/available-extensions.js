export let availableExtensions = [
  {
    name: '##datepicker',
    type: ['input'],
  },
  {
    name: '##tag-list',
    type: ['input'],
  },
  {
    name: '##autosize',
    type: ['textarea'],
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
