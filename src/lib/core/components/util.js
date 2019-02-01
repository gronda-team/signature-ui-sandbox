import _ from 'lodash';
/**
 * Stack higher order components onto a base component
 */
export function stack(...wrappers) {
  return function stackComponent(Component) {
    return wrappers.reduce((C, wrapper) => {
      return wrapper(C);
    }, Component);
  }
}

/*
Filter child component types by child.props.__sui-internal-type
 */
export const byInternalType = (...types) => child => {
  const t = _.get(child.props, '__sui-internal-type');
  if (types.length > 1) {
    // if it's an array we want to match a set of types
    return type.indexOf(t) > -1;
  }
  return t === _.head(types || []);
};

/*
Map React components to their prop value
 */
export const to = propValue => component => _.get(component, ['props', propValue]);
export const toValue = to('value');
