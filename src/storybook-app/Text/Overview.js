import * as React from 'react';
import { Text } from '../../lib/text';
import { Checkbox } from '../../lib/checkbox';

export default class Overview extends React.Component {
  constructor() {
    super();
    this.state = {
      usePangrams: false,
    };

    this.PANGRAMS = [
      'Sphinx of black quartz, judge my vow.',
      'Queen Elizabeth\'s proxy waved off Mick Jagger.',
      'Jelly-like above the high wire, six quaking pachyderms kept the climax of the extravaganza in a dazzling state of flux.',
      'Fred specialized in the job of making very quaint wax toys.',
      'Six crazy kings vowed to abolish my quite pitiful jousts.',
      'What deaf banjo player gives Max Planck quartz?',
      'Lawbooks forgave John Quincy Adams, sixth Prez.',
      'A good quick jab of a pen may vex Will Shortz.',
      'We promptly judged antique ivory buckles for the next prize.',
      'My grandfather picks up quartz and valuable onyx jewels.',
      'When we go back to Juarez, Mexico, do we fly over picturesque Arizona?',
      'A quick movement of the enemy will jeopardize six gunboats.',
    ];
  }

  togglePangrams = () => {
    this.setState(state => ({ usePangrams: !state.usePangrams }));
  };

  render() {
    return (
      <div style={{ maxWidth: '400px' }}>
        <Checkbox
          checked={this.state.usePangrams}
          onChange={this.togglePangrams}
        >
          Toggle pangrams
        </Checkbox>
        <Text is="h1" level="display1">
          { this.state.usePangrams ?
            this.PANGRAMS[0] :
            'Heading 1 / display1'
          }
        </Text>
        <Text is="h2" level="display2">
          { this.state.usePangrams ?
            this.PANGRAMS[1] :
            'Heading 2 / display2'
          }
        </Text>
        <Text is="h3" level="display3">
          { this.state.usePangrams ?
            this.PANGRAMS[2] :
            'Heading 3 / display3'
          }
        </Text>
        <Text is="h4" level="display4">
          { this.state.usePangrams ?
            this.PANGRAMS[3] :
            'Heading 4 / display4'
          }
        </Text>
        <Text is="h5" level="display5">
          { this.state.usePangrams ?
            this.PANGRAMS[4] :
            'Heading 5 / display5'
          }
        </Text>
      </div>
    );
  }
}
