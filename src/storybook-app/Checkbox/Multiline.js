import React from 'react';
import { Checkbox } from '../../lib/checkbox';

class CheckboxOverview extends React.Component {
  constructor() {
    super();

    this.state = { checked: false };
  }

  toggle = () => {
    this.setState(state => ({ checked: !state.checked }));
  };

  render() {
    return (
      <Checkbox checked={this.state.checked} onChange={this.toggle}>
        Bacon ipsum dolor amet dolore pancetta pork belly, qui alcatra doner nostrud tri-tip in. Ut consequat andouille, incididunt cupim ullamco venison sirloin ad. Tenderloin minim ham hock consectetur aliquip flank ham. Ut tenderloin kevin bacon ball tip tongue turducken qui ut enim. Biltong anim nostrud eu ut consequat leberkas drumstick dolore labore pariatur pancetta adipisicing velit reprehenderit. Laboris tenderloin eu ut pastrami ham. Tongue ullamco short ribs hamburger ribeye shoulder ham, doner spare ribs aliquip pariatur jowl ut.
      </Checkbox>
    );
  }
}

export default CheckboxOverview;
