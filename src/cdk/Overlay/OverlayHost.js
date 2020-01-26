import * as React from 'react';
import { OverlayHostRoot } from './styles';
import { useDir } from '../Bidi';

function PlainOverlayHost({ children, ...restProps }, ref) {
  const dir = useDir();

  return <OverlayHostRoot {...restProps} ref={ref} dir={dir}>{ children }</OverlayHostRoot>;
}

const OverlayHost = React.forwardRef(PlainOverlayHost);

export default OverlayHost;
