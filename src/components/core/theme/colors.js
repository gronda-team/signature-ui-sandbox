export const TEXT_SHADES = {
  DARK: '#404040',
  NORMAL: '#747474',
  LIGHT: '#B2B2B2',
  WHITE: '#F0F0F0',
};

export const GREY = {
  0: '#FFFFFF',
  100: TEXT_SHADES.WHITE,
  300: '#E6E6E6',
  500: TEXT_SHADES.LIGHT,
  700: TEXT_SHADES.NORMAL,
  900: TEXT_SHADES.DARK,
  contrast: {
    0: TEXT_SHADES.DARK,
    100: TEXT_SHADES.DARK,
    300: TEXT_SHADES.DARK,
    500: TEXT_SHADES.DARK,
    700: TEXT_SHADES.WHITE,
    900: TEXT_SHADES.WHITE,
  },
};

export const GREEN = {
  100: '#E8F6F2',
  300: '#7ECAB5',
  400: '#56A791',
  500: '#00966E',
  700: '#036A4F',
  900: '#005A42',
  contrast: {
    100: TEXT_SHADES.DARK,
    300: TEXT_SHADES.DARK,
    400: TEXT_SHADES.WHITE,
    500: TEXT_SHADES.WHITE,
    700: TEXT_SHADES.WHITE,
    900: TEXT_SHADES.WHITE,
  },
};

export const LIME_GREEN = {
  500: '#6EA430',
};

export const RED = {
  300: '#E8A196',
  500: '#E2351E',
  700: '#990000',
};

export const RED_ORANGE = {
  500: '#CD4623',
};

export const CYAN = {
  100: '#D4E9F8',
  300: '#B9E7ED',
  500: '#50C5D5',
  700: '#1098AA',
};

export const ORANGE = {
  300: '#F8CA89',
  500: '#FFA300',
  700: '#FF7F00',
};

export const YELLOW = {
  300: '#FFF6B4',
  500: '#E9C141',
};

export const CORE_THEME = { // Gronda theme
  BLACK: GREY[900],
  BLUE: '#103040',
  RED: RED_ORANGE[500],
};

export default {
  GREY, GREEN, LIME_GREEN, RED, RED_ORANGE, CYAN, ORANGE, YELLOW, CORE_THEME, TEXT_SHADES,
};
