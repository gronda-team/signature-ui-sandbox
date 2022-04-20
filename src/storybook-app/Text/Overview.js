import * as React from 'react';
import { Text } from '../../lib/text';
import { Checkbox } from '../../lib/checkbox';
import { GREY } from '../../cdk/theme/colors';

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
      <div style={{ maxWidth: '400px', color: GREY[900] }}>
        <Checkbox
          checked={this.state.usePangrams}
          onChange={this.togglePangrams}
        >
          Toggle pangrams
        </Checkbox>
        <Text as="h1" level="display1">
          { this.state.usePangrams ?
            this.PANGRAMS[0] :
            'Heading 1 / display1'
          }
        </Text>
        <Text as="p" level="body3">
          Bacon ipsum dolor amet burgdoggen sirloin ball tip ham hock, corned beef kevin cupim capicola turkey chicken. Corned beef tenderloin burgdoggen kevin sausage pork chop pancetta porchetta pork loin ham andouille brisket biltong doner. Jerky venison biltong flank. Pork chop corned beef pancetta chicken fatback short ribs ham, beef ribs turkey jerky sirloin ground round. Flank tail prosciutto buffalo.
        </Text>
        <Text as="h2" level="display2">
          { this.state.usePangrams ?
            this.PANGRAMS[1] :
            'Heading 2 / display2'
          }
        </Text>
        <Text as="p" level="body3">
          Pork chop porchetta pastrami, doner kevin biltong flank landjaeger meatball beef ribs venison turducken filet mignon ball tip spare ribs. Pancetta ground round jowl, capicola short ribs flank ham. Burgdoggen bresaola ground round, turkey tongue ham hock ball tip kevin hamburger andouille boudin swine ham doner. T-bone spare ribs sirloin kielbasa short loin jowl venison turducken meatloaf. Pastrami fatback tenderloin jowl landjaeger rump prosciutto cupim tongue jerky turducken pork chop tri-tip. Brisket frankfurter biltong flank tri-tip venison. Ribeye bresaola filet mignon kielbasa venison turducken porchetta.
        </Text>
        <Text as="h3" level="display3">
          { this.state.usePangrams ?
            this.PANGRAMS[2] :
            'Heading 3 / display3'
          }
        </Text>
        <Text as="p" level="body3">
          Burgdoggen spare ribs shoulder cow. Flank prosciutto drumstick, corned beef tri-tip capicola hamburger meatball kielbasa rump short ribs andouille ham meatloaf salami. Hamburger doner beef capicola tri-tip landjaeger kevin shank prosciutto. Prosciutto buffalo beef ball tip, brisket kevin t-bone doner cow.
        </Text>
        <Text as="h4" level="display4">
          { this.state.usePangrams ?
            this.PANGRAMS[3] :
            'Heading 4 / display4'
          }
        </Text>
        <Text as="p" level="body3">
          Kielbasa jerky doner biltong, turducken tail capicola alcatra shoulder sausage pork belly sirloin corned beef strip steak. Spare ribs meatloaf sausage, landjaeger doner shank ham tenderloin drumstick picanha strip steak filet mignon. Cupim meatloaf pork chop venison spare ribs turkey sausage tri-tip chuck chicken ball tip tail. Tail salami ribeye jerky. Alcatra bacon pancetta, short ribs short loin hamburger cupim landjaeger tongue pastrami boudin doner buffalo pork belly. Ribeye pork fatback kevin tongue sirloin. Drumstick buffalo burgdoggen, leberkas t-bone beef ribs corned beef pork chop doner flank tri-tip sausage prosciutto bresaola pork belly.
        </Text>
        <Text as="h5" level="display5">
          { this.state.usePangrams ?
            this.PANGRAMS[4] :
            'Heading 5 / display5'
          }
        </Text>
        <Text as="p" level="body3">
          Short ribs bresaola filet mignon, jerky porchetta chuck short loin. Strip steak porchetta picanha ground round short ribs turducken fatback alcatra meatball pig. Fatback bresaola doner meatloaf, cupim beef biltong ribeye capicola pork kevin beef ribs frankfurter. Tenderloin andouille turkey shankle, biltong buffalo turducken pastrami ham hock spare ribs kevin.
        </Text>
      </div>
    );
  }
}
