export const HUES = ['primary', 'secondary', 'error', 'accent'];
export const HUES_MAP = HUES.reduce((acc, val) => acc[val] = val, {});

export default { HUES, HUES_MAP };
