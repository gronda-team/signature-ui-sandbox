import styled, { css } from 'styled-components';
import _ from 'lodash';
import { convertLevelToStyles } from './utils';
import { generateTypographyConfig } from '../../core/theming/typography';

/**
 * Create the base typography to be injected into the Text component.
 */
export const suiBaseTypography = (config, extraSelector) => css`
padding: 0;
margin: 0;

&[data-text-level=display1] {
  ${convertLevelToStyles(config, 'display1')}
  margin: 0 0 16px;
}

&[data-text-level=display2] {
  ${convertLevelToStyles(config, 'display2')}
  letter-spacing: -0.005em;
  margin: 0 0 16px;
}

&[data-text-level=display3] {
  ${convertLevelToStyles(config, 'display3')}
  letter-spacing: -0.02em;
  margin: 0 0 16px;
}

&[data-text-level=display4] {
  ${convertLevelToStyles(config, 'display4')}
  letter-spacing: -0.05em;
  margin: 0 0 16px;
}

&[data-text-level=display5] {
  ${convertLevelToStyles(config, 'display5')}
  letter-spacing: -0.05em;
  margin: 0 0 12px;
}

&[data-text-level=body1] {
  ${convertLevelToStyles(config, 'body1')}
}

&[data-text-level=body2] {
  ${convertLevelToStyles(config, 'body2')}
}

// Default
&[data-text-level=body3] {
  ${convertLevelToStyles(config, 'body3')}
  p& {
    margin: 0 0 12px;
  }
}

&[data-text-level=micro] {
  ${convertLevelToStyles(config, 'micro')}
}
`;

export const TYPOGRAPHY_DEFAULTS = generateTypographyConfig();

function getTypographyFromScTheme(props) {
  const typography = _.get(props, 'theme.typography', TYPOGRAPHY_DEFAULTS);
  return suiBaseTypography(typography);
}

export const BaseText = styled.span.attrs(props => ({
  'data-text-level': props.level
}))`
${getTypographyFromScTheme}
`;
