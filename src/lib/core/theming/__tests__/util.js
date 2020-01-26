import Color from 'color';
import { BOOTSTRAP_THEME, GREY, BOOTSTRAP_BLUE } from '../palette';
import * as util from '../util';

describe('interpolate', function () {
  it('should correctly linearly interpolate', function () {
    expect(util.interpolate(4, 2, 6, 4, 7))
      .toBeCloseTo(11 / 2, 5);
  });
});

describe('getColor', function () {
  describe('getting default colors', function () {
    it('should get the default shade for color maps', function () {
      const greyColor = Color(util.getColor(BOOTSTRAP_THEME.GREY, 'default'));
      const checkGreyColor = Color(GREY['500']);

      expect(greyColor.rgb().string()).toBe(checkGreyColor.rgb().string());
    });

    it('should return the same color for color strings', function () {
      const blue = Color(util.getColor(BOOTSTRAP_THEME.BLUE, 'default'));
      const checkBlue = Color(BOOTSTRAP_BLUE);

      expect(blue.rgb().string()).toBe(checkBlue.rgb().string());
    });
  });
});
