import styled, { css } from 'styled-components';
import { EASE_OUT_DURATION, EASE_OUT_TIMING_FUNCTION } from '../core/style/variables';
import { getColor } from '../core/theming/util';
import { IconRoot } from '../Icon/styles';
import { ButtonRoot } from '../Button/styles';

// Infix stretches to fit the container, but naturally wants to be this wide. We set this in order
// to have a a consistent natural size for the various types of controls that can go in a form
// field.
export const FORM_FIELD_DEFAULT_INFIX_WIDTH = '180px';

// Global wrapper. We need to apply margin to the element for spacing, but
// cannot apply it to the host element directly.
export const FormFieldWrapper = styled.div`
  position: relative;
`;

// We use a flex layout to baseline align the prefix and suffix elements.
// The underline is outside of it so it can cover all of the elements under this flex container.
export const FormFieldFlex = styled.div`
  display: inline-flex;
  align-items: baseline;
  box-sizing: border-box;
  width: 100%;
`;

export const FormFieldFullOutline = styled.div``;

export const FormFieldFix = styled.div`
  white-space: nowrap;
  flex: none;
  position: relative;
`;

export const FormFieldPrefix = styled(FormFieldFix)`/*!*/`;
export const FormFieldSuffix = styled(FormFieldFix)`/*!*/`;

export const FormFieldInfix = styled.div`
  display: block;
  position: relative;
  flex: auto;
  min-width: 0;
  width: ${FORM_FIELD_DEFAULT_INFIX_WIDTH};
  @media (-ms-high-contrast: active) {
    border-image: linear-gradient(transparent, transparent);
  }
`;

const handleIconSizing = css`
  ${IconRoot} {
    width: 1em;
    height: 1em;
    font-size: inherit;
    vertical-align: baseline;
  }
`;

// Used to hide the label overflow on IE, since IE doesn't take transform into account when
// determining overflow.
export const FormFieldLabelWrapper = styled.div`
  position: absolute;
  left: 0;
  box-sizing: content-box;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;  // We shouldn't catch mouse events (let them through).

  [dir="rtl"] & {
    // Usually this isn't necessary since the element is 100% wide, but
    // when we've got a select node, we need to set a max-width on it.
    left: auto;
    right: 0;
  }
  
  ${handleIconSizing}
`;

export const FormFieldLabel = styled.div`
  // The label is after the form field control, but needs to be aligned top-left of the infix div.
  position: absolute;
  left: 0;

  font: inherit;
  pointer-events: none;  // We shouldn't catch mouse events (let them through).

  // Put ellipsis text overflow.
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;

  transform-origin: 0 0;
  transition: transform ${EASE_OUT_DURATION} ${EASE_OUT_TIMING_FUNCTION},
              color ${EASE_OUT_DURATION} ${EASE_OUT_TIMING_FUNCTION},
              width ${EASE_OUT_DURATION} ${EASE_OUT_TIMING_FUNCTION};

  // Hide the label initially, and only show it when it's floating or the control is empty.
  display: block;
  
  [dir="rtl"] & {
    transform-origin: 100% 0;
    left: auto;
    right: 0;
  }
`;

export const FormFieldLabelAnchor = styled.div``;

export const FormFieldUnderline = styled.div`
  position: absolute;
  width: 100%;
  // Need this so that the underline doesn't block the hover effect.
  pointer-events: none;
  // We transform the height slightly higher to fix inconsistent underline height for some DPIs.
  // Without this we observed that at zoom levels between 50% and 100% some form-field underlines
  // would disappear. The issue appears to be related to fractional pixels since (e.g. underlines
  // with their top at x.6 would disappear, but ones with there top at x.7 were fine). The exact
  // fractions that caused problems seemed to depend on the screen resolution and zoom level. We
  // experimentally discovered that adding a very slight scale factor fixes the issue.
  transform: scaleY(1.0001);
`;

export const FormFieldRequiredMarker = styled.div``;

// Wrapper for the hints and error messages.
export const FormFieldSubscriptWrapper = styled.div`
  position: absolute;
  box-sizing: border-box;
  width: 100%;
  overflow: hidden; // prevents multi-line errors from overlapping the control
  ${handleIconSizing}
`;

// Clears the floats on the hints. This is necessary for the hint animation to work.
export const FormFieldHintWrapper = styled.div`
  display: flex;
`;

// Spacer used to make sure start and end hints have enough space between them.
export const FormFieldHintSpacer = styled.div`
  flex: 1 0 1em;
`;

export const FormFieldHint = styled.div``;

export const FormFieldHintAnchor = styled.div``;

/**
 * Theming
 */
function baseTheme(props) {
  const colors = props.theme.colors;

  const labelColor = getColor(colors.GREY, 900, 0.6);
  const focusedLabelColor = getColor(colors.PRIMARY);
  const requiredLabelColor = getColor(colors.ACCENT);
  const warnColor = getColor(colors.WARN);

  return css`
    ${FormFieldLabel}, ${FormFieldHint} {
      color: ${labelColor};
    }
    
    &[data-focused="true"] {
      ${FormFieldLabel} {
        color: ${focusedLabelColor};
      }
      
      ${FormFieldRequiredMarker} {
        color: ${requiredLabelColor};
      }
      
      &[data-color="accent"] {
        ${FormFieldLabel} {
          color: ${requiredLabelColor};
        }
      }
      
      &[data-color="warn"] {
        ${FormFieldLabel} {
          color: ${warnColor};
        }
      }
    }
  `;
}

function baseTypography(props) {
  // The unit-less line-height from the font config.
  const lineHeight = 1.125;
  // The amount to scale the font for the floating label and subscript.
  const subscriptFontScale = 0.75;
  // The amount to scale the font for the prefix and suffix icons.
  const prefixSuffixIconFontScale = 1.5;
  // The padding on the infix. Mocks show half of the text size.
  const infixPadding = '0.5em';
  // The margin applied to the form-field-infix to reserve space for the floating label.
  const infixMarginTop = `calc(1em * ${lineHeight} * ${subscriptFontScale})`;
  // Font size to use for the label and subscript text.
  const subscriptFontSize = `calc(${subscriptFontScale} * 100%)`;
  // Font size to use for the for the prefix and suffix icons.
  const prefixSuffixIconFontSize = `calc(${prefixSuffixIconFontScale} * 100%)`;
  // The space between the bottom of the .mat-form-field-flex area and the subscript wrapper.
  // Mocks show half of the text size, but this margin is applied to an element with the subscript
  // text font size, so we need to divide by the scale factor to make it half of the original text
  // size.
  const subscriptMarginTop = `calc(0.25em / ${subscriptFontScale})`;
  // The padding applied to the form-field-wrapper to reserve space for the subscript, since it's
  // absolutely positioned. This is a combination of the subscript's margin and line-height, but we
  // need to multiply by the subscript font scale factor since the wrapper has a larger font size.
  const wrapperPaddingBottom =
    `calc((${subscriptMarginTop} + ${lineHeight}em) * ${subscriptFontScale})`;

  return css`
    ${FormFieldWrapper} {
      padding-bottom: ${wrapperPaddingBottom};
    }
    
    ${FormFieldFix} {
      // Allow icons in a prefix or suffix to adapt to the correct size.
      ${IconRoot} {
        font-size: ${prefixSuffixIconFontSize};
        line-height: ${lineHeight};
      }
      
      // Allow icon buttons in a prefix or suffix to adapt to the correct size.
      ${ButtonRoot}[data-type="icon"] {
        font-size: calc(${prefixSuffixIconFontScale} * 1em);
        line-height: calc(${prefixSuffixIconFontScale} * 1em);
        
        ${IconRoot} {
          height: 1em;
          line-height: 1em;
        }
      }
      
      ${IconRoot} {
        display: block;
        font-size: inherit;
        width: 1.5em;
        height: 1.5em;
      }
      
      ${ButtonRoot}[data-type="icon"] ${IconRoot} {
        margin: auto;
      }
    }
    
    ${FormFieldInfix} {
      padding: ${infixPadding} 0;
      // Throws off the baseline if we do it as a real margin, so we do it as a border instead.
      border-top: ${infixMarginTop} solid transparent;
    }
    
    ${FormFieldLabel} {
      transform: translateY(calc((${infixMarginTop} * -1) - ${infixPadding}));
      width: 100%;
    }
    
    ${FormFieldLabelWrapper} {
      top: calc(${infixMarginTop} * -1);
      padding-top: ${infixMarginTop};
    }
    
    ${FormFieldLabel} {
      top: calc(${infixMarginTop} + ${infixPadding});
    }
    
    ${FormFieldUnderline} {
      bottom: ${wrapperPaddingBottom};
      transition: background-color 300ms ${EASE_OUT_TIMING_FUNCTION};
    }
    
    ${FormFieldSubscriptWrapper} {
      font-size: ${subscriptFontSize};
      margin-top: ${subscriptMarginTop};
      
      // We want the subscript to start at the end of the content box, not the padding box,
      // so we move it up by the padding amount (adjusted for the smaller font size);
      top: calc(100% - (${wrapperPaddingBottom} / ${subscriptFontScale}));
    }
  `;
}

function underlineTypography(props) {
  // The height of the underline.
  const standardUnderlineHeight = '1px';
  // The padding between the top of the form field and the label text (used to align the standard
  // form field with the fill and outline appearances).
  const standardPaddingTop = '0.75em';

  return css`
    ${FormFieldFlex} {
      padding-top: ${standardPaddingTop};
    }
    
    ${FormFieldUnderline} {
      height: ${standardUnderlineHeight};
      
      @media (-ms-high-contrast: active) {
        height: 0;
        border-top: solid ${standardUnderlineHeight};
      }
    }
    
    &[data-disabled="true"] ${FormFieldUnderline} {
      background-position: 0;
      background-color: transparent;
      
      @media (-ms-high-contrast: active) {
        border-top-style: dotted;
        border-top-width: 2px;
      }
    }
  `;
}

function underlineTheme(props) {
  const colors = props.theme.colors;

  const dynamicColorTheme = Object.keys(colors).reduce((acc, name) => {
    if (name === 'GREY') return acc;
    return acc + `
      &[data-color="${name.toLowerCase()}"] {
        ${FormFieldUnderline} {
          background-color: ${getColor(colors[name])};
        }
      }
    `;
  }, '');

  const underlineColor = getColor(colors.GREY, 900, 0.12 * 0.88);

  return css`
    ${FormFieldUnderline} {
      background-color: ${underlineColor};
    }
    
    &[data-focused="true"] {
      &[data-color="primary"] {
        caret-color: ${getColor(colors.PRIMARY)};
      }
      
      &[data-color="accent"] {
        caret-color: ${getColor(colors.ACCENT)};
      }
      
      &[data-color="warn"] {
        caret-color: ${getColor(colors.WARN)};
      }
      
      ${dynamicColorTheme}
    }
  `;
}

/**
 * Stroked styling
 */
function strokedStyle(props) {
  // The unit-less line-height from the font config.
  const lineHeight = 1.125;
  // The horizontal padding between the edge of the form field fill box and the start of the text.
  const outlineSidePadding = '0.5em';
  // The scale of the subscript and floating label text w.r.t the value text.
  const outlineSubscriptFontScale = 0.75;
  const labelFontScale = 1;
  // Bottom label padding
  const bottomLabelPadding = '0.25em';
  // The amount of overlap between the label and the outline.
  const outlineLabelOverlap = '0.25em';
  // The border radius of the outline.
  const borderRadius = '4px';
  // The width of the outline.
  const outlineWidth = '1px';
  // The margin applied to the form-field-infix to reserve space for the floating label.
  const infixMarginTop = `calc((1em * ${lineHeight} * ${labelFontScale}) + ${bottomLabelPadding})`;
  // The horizontal padding between the edge of the subscript box and the start of the subscript
  // text.
  const outlineSubscriptPadding = `calc(${outlineSidePadding} / ${outlineSubscriptFontScale})`;

  return css`
    ${FormFieldWrapper} {
      margin: ${outlineLabelOverlap} 0;
    }
    
    ${FormFieldFlex} {
      padding: 0 ${outlineSidePadding} 0 ${outlineSidePadding};
      margin-top: -${outlineLabelOverlap};
      position: relative;
    }
    
    ${FormFieldFix} {
      top: calc(${outlineLabelOverlap} + ${bottomLabelPadding});
    }
    
    ${FormFieldInfix} {
      border-top-width: ${infixMarginTop};
    }
    
    ${FormFieldFullOutline} {
      display: flex;
      position: absolute;
      top: ${infixMarginTop};
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      border: ${outlineWidth} solid currentColor;
      min-width: calc(2 * ${borderRadius});
      border-radius: ${borderRadius};
      transition: border-color 300ms ${EASE_OUT_TIMING_FUNCTION},
        color 300ms ${EASE_OUT_TIMING_FUNCTION};
    }
    
    ${FormFieldSubscriptWrapper} {
      padding: 0 ${outlineSubscriptPadding};
    }
  `;
}

function strokedTypography(props) {
  const minOutlineHeight = '42px';
  // The unit-less line-height from the font config.
  const lineHeight = 1.125;
  // The amount to scale the font for the floating label and subscript.
  const labelFontScale = 1;
  // Padding for the bottom label
  const labelBottomPadding = '0.25em';
  // Vertical padding to reach 42px
  const verticalInfixPadding = `calc((${minOutlineHeight} - ${lineHeight}em - 2px) / 2)`;
  // The padding on the infix. Mocks show half of the text size.
  const infixPadding = '0.5em';
  // The margin applied to the form-field-infix to reserve space for the floating label.
  const infixMarginTop = `calc(1em * ${lineHeight} * ${labelFontScale})`;
  // The amount we offset the label from the input text in the outline appearance.
  const labelOffset = '-0.5em';

  return css`
    ${FormFieldInfix} {
      padding: ${verticalInfixPadding} 0 ${verticalInfixPadding} 0;
    }
    
    ${FormFieldLabelWrapper} {
      top: calc(${infixMarginTop} * -1 - ${labelBottomPadding});
      padding-top: calc(${infixMarginTop} + ${labelBottomPadding});
    }
    
    ${FormFieldLabel} {
      top: calc(${infixMarginTop} + ${infixPadding});
      margin-top: ${labelOffset};
      transform: translateY(calc((${infixMarginTop} * -1) - (${infixPadding} + ${labelOffset})));
      width: 100%;
    }
  `;
}

function strokedTheme(props) {
  const colors = props.theme.colors;

  const focusedLabelColor = getColor(colors.PRIMARY);
  const requiredLabelColor = getColor(colors.ACCENT);
  const warnColor = getColor(colors.WARN);
  const outlineColor = getColor(colors.GREY, 900, 0.88 * 0.12);

  return css`
    ${FormFieldFullOutline} {
      color: ${outlineColor};
    }
    
    &[data-focused="true"] {
      ${FormFieldFullOutline} {
        color: ${focusedLabelColor};
      }
      
      &[data-color="accent"] {
        ${FormFieldFullOutline} {
          color: ${requiredLabelColor};
        }
      }
      
      &[data-color="warn"] {
        ${FormFieldFullOutline} {
          color: ${warnColor};
        }
      }
    }
  `;
}

export const FormFieldRoot = styled.div`
  display: inline-block;
  position: relative;
  // Avoid problems with text-align
  text-align: left;
  
  [dir="rtl"] & {
    text-align: right;
  }
  
  ${baseTypography}
  ${baseTheme}
  
  &[data-appearance="underline"] {
    ${underlineTypography}
    ${underlineTheme}
  }
  
  &[data-appearance="stroked"] {
    ${strokedStyle}
    ${strokedTypography}
    ${strokedTheme}
  }
`;
