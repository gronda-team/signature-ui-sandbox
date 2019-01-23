import * as React from 'react';
import _ from 'lodash';
import { FormField } from '../../lib/form-field';
import { TagList, TagInput, Tag } from '../../lib/tags';
import { COMMA, ENTER } from '../../cdk/keycodes/keys';

export default class CreateStory extends React.Component {
  constructor() {
    super();
    
    this.state = {
      emails: ['ray@gronda.eu', 'alex@gronda.eu', 'john@gronda.eu', 'jane@gronda.eu'],
      email: '',
    };
  }
  
  onChange = (event) => {
    this.setState({ email: event.target.value });
  };
  
  onRemove = ({ value }) => {
    this.setState(state => ({
      emails: _.without(state.emails, value),
    }));
  };
  
  addTag = ({ value }) => {
    this.setState(state => ({
      emails: _.uniq([...state.emails, value]),
      email: '',
    }));
  };
  
  render() {
    return (
      <TagList>
        { this.state.emails.map((email, index) => (
          <Tag
            removable
            key={email}
            value={email}
            disabled={email.indexOf('alex') > -1}
            onRemove={this.onRemove}
          >{ email }</Tag>
        ))}
        <TagInput
          value={this.state.email}
          onChange={this.onChange}
          addTag={this.addTag}
          separatorKeyCodes={[ENTER, COMMA]}
        />
      </TagList>
    )
  }
}
