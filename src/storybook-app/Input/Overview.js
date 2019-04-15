import * as React from 'react';
import { Input } from '../../lib/input';
import { FormField, Label } from '../../lib/form-field';
import Checkbox from '../../lib/checkbox/Checkbox';

export default class Overview extends React.Component {
  constructor() {
    super();
    this.state = {
      food: '',
      comment: '',
      disabled: false,
    };
  }

  onChangeTextFor = state => (event) => {
    this.setState({
      [state]: event.target.value,
    });
  };

  onChangeDisabled = () => {
    this.setState(state => ({
      disabled: !state.disabled,
    }));
  };

  render() {
    return (
      <div>
        <FormField style={{ width: '400px', display: 'block' }}>
          <Label>
            Favorite food
          </Label>
          <Input
            placeholder="Sushi"
            onChange={this.onChangeTextFor('food')}
            value={this.state.food}
            disabled={this.state.disabled}
          />
        </FormField>
        <FormField style={{ width: '400px', display: 'block' }}>
          <Label>
            Leave a comment
          </Label>
          <Input
            as="textarea"
            placeholder="Tell us your thoughts"
            onChange={this.onChangeTextFor('comment')}
            value={this.state.comment}
            disabled={this.state.disabled}
          />
        </FormField>
        <Checkbox checked={this.state.disabled} onChange={this.onChangeDisabled}>
          Disable
        </Checkbox>
      </div>
    );
  }
}
