import styled from 'styled-components';
import PropTypes from 'prop-types';
import { GREEN, GREY, RED } from '../../core/theme/colors';
import { TRANSITION } from '../../core/theme/transitions';

const DISABLED_BORDER = GREY[100];
const IDLE_BORDER = GREY[500];
const HOVER_BORDER = GREY[700];
const ACTIVE_BORDER = GREEN[500];
const ACTIVE = ACTIVE_BORDER;
const ERROR_BORDER = RED[500];
const ERROR = ERROR_BORDER;

const SUBSCRIPT_MARGIN = '4px';
const WRAPPER_PADDING_BOTTOM = '1em';



export const FormFieldWrapper = styled.div`
position: relative;
padding-bottom: 1em;
`;

export const FormFieldSubWrapper = styled.div`
position: absolute;
top: calc(100% - ${WRAPPER_PADDING_BOTTOM});
width: 100%;
`;

export const FormFieldOutlineBase = styled.div`
border: solid 1px;
border-radius: 4px;
min-height: 32px;
padding: 0 12px;
`;

// With actual styling
export const FormFieldOutline = FormFieldOutlineBase.extend`
display: flex;
align-items: center;
transition: border-color ${TRANSITION()};
border-color: ${IDLE_BORDER};
cursor: pointer;
&[data-state="idle"] {
  &:hover { border-color: ${HOVER_BORDER}; }
}
&[data-state="focus"] { box-shadow: 0 2px 1px rgba(0, 0, 0, 0.12); border-color: ${ACTIVE_BORDER}; }

&[aria-invalid="true"] { border-color: ${ERROR_BORDER}; }
&[aria-disabled="true"] { background-color: ${DISABLED_BORDER}; }
`;

export const FormFieldFlex = styled.div`
display: inline-flex;
align-items: baseline;
box-sizing: border-box;
width: 100%;
`;

export const FormFieldFix = styled.div`
white-space: nowrap;
flex: none;
position: relative;
font-size: 0.9em;
width: 1em;
height: 1em;
`;

export const FormFieldContent = styled.div`
display: block;
position: relative;
flex: auto;
min-width: 0;
width:
`;

// Hints
export const FormFieldHintWrapper = styled.div`
display: flex;
font-size: 75%;
margin-top: ${SUBSCRIPT_MARGIN};
`;

export const FormFieldHintSpacer = styled.div.attrs({
  'aria-hidden': true,
})`flex: 1 0 1em`;

export const FormFieldHintStyle = styled.div`
text-align: ${props => props.align === 'start' ? 'left' : 'right'};
`;

FormFieldHintStyle.propTypes = { align: PropTypes.oneOf(['start', 'end']) };
FormFieldHintStyle.defaultProps = { align: 'start' };

export const FormFieldErrorStyle = styled.div.attrs({
  role: 'alert'
})`
color: ${ERROR};
`;


// label stuff
export const LabelStyle = styled.label`
margin: 0 0 8px;
padding: 0;
display: block;
&[data-state="focus"]
`;

export const LabelRequiredStatus = styled.span.attrs({
  'aria-hidden': true,
})`
transition: color ${TRANSITION()};
&[data-state="focus"] {
  color: ${props => props.status === 'required' ? ERROR : 'inherit'};
}
`;

LabelRequiredStatus.propTypes = {
  status: PropTypes.oneOf(['required', 'optional']),
};

LabelRequiredStatus.defaultProps = { status: 'required' };

// Input styles
export const InputStyle = styled.input`
border: 0;
outline: 0;
padding: 0;
margin: 0;
width: 100%;
font: inherit;
background-color: transparent;
max-width: 100%;
vertical-align: bottom;
text-align: inherit;
caret-color: ${ACTIVE};
&:-moz-ui-invalid {
  box-shadow: none;
}

// Remove IE's default clear and reveal icons.
&::-ms-clear,
&::-ms-reveal {
  display: none;
}

// Clear Safari's decorations for search fields.
&,
&::-webkit-search-cancel-button,
&::-webkit-search-decoration,
&::-webkit-search-results-button,
&::-webkit-search-results-decoration {
  -webkit-appearance: none;
}

// Also clear Safari's autofill icons. Note that this can't be in the
// same selector as the IE ones, otherwise Safari will ignore it.
&::-webkit-contacts-auto-fill-button,
&::-webkit-caps-lock-indicator,
&::-webkit-credentials-auto-fill-button {
  visibility: hidden;
}

// Fixes an issue on iOS where the following input types will collapse to 1px,
// if they're empty, because we've overridden their background color.
// See: https://stackoverflow.com/questions/18381594/input-type-date-appearance-in-safari-on-ios
&[type='date'],
&[type='datetime'],
&[type='datetime-local'],
&[type='month'],
&[type='week'],
&[type='time'] {
  &::after {
    content: ' ';
    white-space: pre;
    width: 1px;
  }
}
`;
