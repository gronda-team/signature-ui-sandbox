import * as React from 'react';
import { Input } from '../../lib/input';
import { FormField, Label } from '../../lib/form-field';

export default class Overview extends React.Component {
  constructor() {
    super();
    this.state = {
      food: '',
      comment: '',
    };
  }

  onChangeTextFor = state => (event) => {
    this.setState({
      [state]: event.target.value,
    });
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
          />
        </FormField>
      </div>
    );
  }
}
