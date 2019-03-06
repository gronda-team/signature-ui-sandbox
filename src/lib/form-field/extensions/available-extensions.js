export let availableExtensions = [
  {
    name: '##datepicker',
    type: 'input',
  },
  {
    name: '##tag-list',
    type: 'input',
  },
  {
    name: '##autosize',
    type: 'textarea',
  },
  {
    name: '##autofill',
    type: 'both',
  },
  {
    name: '##autocomplete',
    type: 'both',
  },
];

export function addExtension(...extensions) {
  availableExtensions = availableExtensions.concat(extensions);
}
