import React from 'react';
import { FormFieldHintStyle } from './styles';

const Hint = ({ align, children }) => <FormFieldHintStyle align={align}>{ children }</FormFieldHintStyle>;

Hint.propTypes = { align: FormFieldHintStyle.propTypes.align };
Hint.defaultProps = { align: FormFieldHintStyle.defaultProps.align };

export default Hint;