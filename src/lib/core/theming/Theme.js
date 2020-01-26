import React from 'react';
import PropTypes from 'prop-types';
import extend from 'lodash/extend';
import { ThemeProvider } from 'styled-components';
import { BOOTSTRAP_THEME, BOOTSTRAP_INDIGO, BOOTSTRAP_PINK, BOOTSTRAP_RED } from './palette';

const DEFAULT_THEME = {
  ...BOOTSTRAP_THEME,
  PRIMARY: BOOTSTRAP_INDIGO,
  ACCENT: BOOTSTRAP_PINK,
  WARN: BOOTSTRAP_RED,
};

function Theme({ colors, typography, linkAliases, buttonAliases, children }) {
  const themeColor = React.useMemo(() => (
    extend({}, DEFAULT_THEME, colors)
  ), [colors]);

  const theme = React.useMemo(() => ({
    typography,
    linkAliases,
    buttonAliases,
    colors: themeColor,
  }), [themeColor, typography, linkAliases, buttonAliases]);

  return (
    <ThemeProvider theme={theme}>{ children }</ThemeProvider>
  );
}

Theme.propTypes = {
  colors: PropTypes.object,
  typography: PropTypes.object,
  /**
   * Components like the React Router links that can be aliased onto
   * the Button component. Since the Button component needs to know if the
   *
   */
  linkAliases: PropTypes.arrayOf(PropTypes.func),
  buttonAliases: PropTypes.arrayOf(PropTypes.func),
};

Theme.defaultProps = {
  colors: DEFAULT_THEME,
  typography: {},
  linkAliases: [],
  buttonAliases: [],
};

export default Theme;
