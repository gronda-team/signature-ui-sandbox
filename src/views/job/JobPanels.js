import * as React from 'react';
import _ from 'lodash';
import JOBS from './data/jobs.json';
import {
  Accordion, ExpansionPanelHeader, ExpansionPanel,
  ExpansionPanelDescription, ExpansionPanelTitle, ExpansionPanelActionRow
} from '../../lib/expansion';
import { Button } from '../../lib/button';

export default class JobPanels extends React.Component {
  constructor() {
    super();
    
    this.state = {
      active: null,
    };
  }
  
  onSelect = (event) => {
    this.setState({
      active: event.opened || null,
    });
  };
  
  render() {
    return (
      <Accordion style={{ maxWidth: '600px' }} onSelect={this.onSelect} expanded={this.state.active}>
        { JOBS.map((job, index) => (
          <ExpansionPanel key={job.id} disabled={index === 2}>
            <ExpansionPanelHeader>
              <ExpansionPanelTitle>{ job.name }</ExpansionPanelTitle>
              <ExpansionPanelDescription>{ job.company.name }</ExpansionPanelDescription>
            </ExpansionPanelHeader>
            <p>{ job.description }</p>
            <ExpansionPanelActionRow>
              <Button color={'secondary'} type={'stroked'}>Cancel</Button>
              <Button color={'primary'}>Save</Button>
            </ExpansionPanelActionRow>
          </ExpansionPanel>
        ))}
      </Accordion>
    );
  }
}
