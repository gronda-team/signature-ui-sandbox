import * as React from 'react';
import PropTypes from 'prop-types';
import { DirectionalityContext } from './context';

function Directionality({ dir, children }) {
  const normalizedDir = React.useMemo(() => {
    const normalizedValue = dir.toLowerCase();
    return (normalizedValue === 'ltr' || normalizedValue === 'rtl') ? normalizedValue : 'ltr';
  }, [dir]);

  return (
    <DirectionalityContext.Provider value={normalizedDir}>
      { children }
    </DirectionalityContext.Provider>
  )
}

Directionality.propTypes = {
  dir: PropTypes.string,
};

Directionality.defaultProps = {
  dir: 'ltr',
};

export default Directionality;
