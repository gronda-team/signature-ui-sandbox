import * as React from 'react';
import noop from 'lodash/noop';

export const IconContext = React.createContext({
  serializer: { serializeToString: () => '' },
  addSvgIcon: noop,
  addSvgIconLiteral: noop,
  addSvgIconInNamespace: noop,
  addSvgIconLiteralInNamespace: noop,
  addSvgIconSet: noop,
  addSvgIconSetLiteral: noop,
  addSvgIconSetInNamespace: noop,
  addSvgIconSetLiteralInNamespace: noop,
  registerFontClassAlias: noop,
  classNameForFontAlias: noop,
  setDefaultFontSetClass: noop,
  getDefaultFontSetClass: noop,
  getSvgIconFromUrl: noop,
  getNamedSvgIcon: noop,
});


export function useIconRegistry() {
  return React.useContext(IconContext);
}
