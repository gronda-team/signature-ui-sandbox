import _ from 'lodash';

/**
 * Create basic typography level as a CSS value.
 * @param fontSize
 * @param lineHeight
 * @param fontWeight
 * @param fontFamily
 * @param letterSpacing
 * @return object The typography object with its own properties.
 */
export const generateTypographyLevel = ({
  fontSize, lineHeight = fontSize, fontWeight = 400, fontFamily = null, letterSpacing = null,
}) => {
  const DEFAULTS = { lineHeight: fontSize, fontWeight: 400, fontFamily: null, letterSpacing: null };
  return {
    ...DEFAULTS,
    fontSize, lineHeight, fontWeight, fontFamily, letterSpacing,
  };
};

/**
 * Create default configuration
 */
const BASE_TYPOGRAPHY_LEVELS = {
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  display1: generateTypographyLevel({ fontSize: '30px', lineHeight: '41px', fontWeight: '700' }),
  display2: generateTypographyLevel({ fontSize: '24px', lineHeight: '33px', fontWeight: '700' }),
  display3: generateTypographyLevel({ fontSize: '20px', lineHeight: '27px', fontWeight: '700' }),
  display4: generateTypographyLevel({ fontSize: '16px', lineHeight: '28px', fontWeight: '700' }),
  display5: generateTypographyLevel({ fontSize: '14px', lineHeight: '24px', fontWeight: '700' }),
  body1: generateTypographyLevel({ fontSize: '19px', lineHeight: '30px' }),
  body2: generateTypographyLevel({ fontSize: '16px', lineHeight: '27px' }),
  body3: generateTypographyLevel({ fontSize: '14px', lineHeight: '22px' }),
  micro: generateTypographyLevel({ fontSize: '12px', lineHeight: '22px' }),
  button: generateTypographyLevel({ fontSize: '14px', lineHeight: '14px' }),
  input: generateTypographyLevel({ fontSize: 'inherit', lineHeight: '1.4285' }),
};

export function generateTypographyConfig(typographyConfig = BASE_TYPOGRAPHY_LEVELS) {
  /**
   * Iterate through all the levels in the config (above, accessed via arguments[0]) and add the
   * font-family property (fontFamily) for any levels that don't currently have it.
   */
  const config = { ...BASE_TYPOGRAPHY_LEVELS, ...typographyConfig };
  const { fontFamily, ...levels } = config;
  _.each(levels, (value, key) => {
    if (!value.fontFamily) {
      levels[key] = { ...value, fontFamily };
    }
  });

  return { ...levels, fontFamily };
}

export const DEFAULT_TYPOGRAPHY_CONFIG = generateTypographyConfig();
