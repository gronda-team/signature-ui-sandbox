import styled, { css } from 'styled-components';
import { convertLevelToStyles, convertPropertiesToShorthand } from './utils';

/**
 * Create basic typography level as a CSS value.
 * @param fontSize
 * @param lineHeight
 * @param fontWeight
 * @param fontFamily
 * @param letterSpacing
 * @return object The typography object with its own properties.
 */
export const createTypographyLevel = ({
  fontSize,
  lineHeight = fontSize,
  fontWeight = 400,
  fontFamily = null,
  letterSpacing = null,
}) => arguments[0];

/**
 * Create default configuration
 */
export const createTypographyConfig = ({
  fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  display1 = createTypographyLevel({ fontSize: '30px', lineHeight: '36px', fontWeight: '500' }),
  display2 = createTypographyLevel({ fontSize: '24px', lineHeight: '32px', fontWeight: '500' }),
  display3 = createTypographyLevel({ fontSize: '20px', lineHeight: '32px', fontWeight: '500' }),
  display4 = createTypographyLevel({ fontSize: '16px', lineHeight: '28px', fontWeight: '500' }),
  display5 = createTypographyLevel({ fontSize: '14px', lineHeight: '24px', fontWeight: '500' }),
  body1 = createTypographyLevel({ fontSize: '19px', lineHeight: '32px' }),
  body2 = createTypographyLevel({ fontSize: '16px', lineHeight: '24px' }),
  body3 = createTypographyLevel({ fontSize: '14px', lineHeight: '20px' }),
  micro = createTypographyLevel({ fontSize: '12px', lineHeight: '20px' }),
  button = createTypographyLevel({ fontSize: '14px', lineHeight: '14px' }),
  input = createTypographyLevel({ fontSize: 'inherit', lineHeight: '1.125' }),
}) => {
  /**
   * Iterate through all the levels in the config (above, accessed via arguments[0]) and add the
   * font-family property (fontFamily) for any levels that don't currently have it.
   */
  const { fontFamily: font, ...levels } = arguments[0];
  _.each(levels, (value, key, config) => {
    if (!value.fontFamily) {
      config[key] = { ...value, fontFamily };
    }
  });

  return { ...config, fontFamily };
};

/**
 * Create the base typography to be injected into the Text component.
 */
export const suiBaseTypography = (config, extraSelector) => css`
&[data-text-level=display1] {
  ${convertLevelToStyles(config, 'display1')}
  margin: 0 0 64px;
}

&[data-text-level=display2] {
  ${convertLevelToStyles(config, 'display2')}
  letter-spacing: -0.005em;
  margin: 0 0 64px;
}

&[data-text-level=display3] {
  ${convertLevelToStyles(config, 'display3')}
  letter-spacing: -0.02em;
  margin: 0 0 64px;
}

&[data-text-level=display4] {
  ${convertLevelToStyles(config, 'display4')}
  letter-spacing: -0.05em;
  margin: 0 0 64px;
}

&[data-text-level=display5] {
  ${convertLevelToStyles(config, 'display5')}
  letter-spacing: -0.05em;
  margin: 0 0 64px;
}
`;

const DEFAULT_CONFIG = createTypographyConfig();

export const BaseText = styled.span`
${suiBaseTypography(DEFAULT_CONFIG)}
`;
