import * as React from 'react';
import { Button } from '../../lib/button';
import { Dialog } from '../../lib/dialog';
import { DialogActions, DialogContent, DialogTitle } from '../../lib/dialog/styles';

export default class Overview extends React.Component {
  constructor() {
    super();
    this.state = {
      showModal: false,
    };
  }

  toggleModal = () => {
    this.setState(state => ({
      showModal: !state.showModal,
    }));
  };

  render() {
    return (
      <div>
        <Button onClick={this.toggleModal}>
          View terms and conditions
        </Button>
        <Dialog
          width="500"
          open={this.state.showModal}
          onClose={this.toggleModal}
        >
          <DialogTitle>
            Bacon Ipsum Terms & Conditions
          </DialogTitle>
          <DialogContent>
            <p>
              Spicy jalapeno bacon ipsum dolor amet spare ribs
              tenderloin chuck, pork chop pork loin ribeye pancetta
              picanha porchetta bresaola jowl chicken corned beef.
              Frankfurter chuck t-bone sausage venison. Jerky tongue
              alcatra, filet mignon chuck ground round chicken beef
              ribs short loin beef boudin pork belly. Jerky pancetta
              leberkas, pig bacon chuck ribeye cow. Swine kielbasa
              pork chop, meatball venison corned beef bacon boudin.
              Brisket prosciutto rump chuck meatball jowl hamburger.
              Strip steak jowl porchetta pastrami.
            </p>
            <p>
              Flank ground round ball tip pig. Turkey ham hock rump
              strip steak meatloaf andouille salami frankfurter pork
              chop jerky short ribs filet mignon prosciutto alcatra.
              Chicken prosciutto hamburger buffalo boudin corned beef
              cupim tongue capicola ham chuck sausage ball tip filet
              mignon. Spare ribs bacon landjaeger fatback, swine ham
              hock pastrami chicken jerky sausage beef ribs kielbasa
              brisket pork belly pig.
            </p>
          </DialogContent>
          <DialogActions>
            <Button color="secondary">
              Cancel
            </Button>
            <Button>
              Agree
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}
