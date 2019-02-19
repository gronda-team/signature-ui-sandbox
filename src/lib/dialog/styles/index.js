import styled from 'styled-components';

export const DialogContainerRoot = styled.div`
&[data-state=null], &[data-state=exit] {
  opacity: 0;
  transform: scale(0.7);
  transition: opacity 75ms cubic-bezier(0.4, 0.0, 0.2, 1),
    transform 75ms cubic-bezier(0.4, 0.0, 0.2, 1);
}

&[data-state=enter] {
  transform: none;
  transition: opacity 150ms cubic-bezier(0, 0, 0.2, 1),
    transform 150ms cubic-bezier(0, 0, 0.2, 1);
}
`;
