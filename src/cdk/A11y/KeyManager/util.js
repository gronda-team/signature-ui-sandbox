import debounce from 'lodash/debounce';

// Return a common module that can be used between implementation and testing so that
// we don't have to import the entire lodash module.
export default { debounce };
