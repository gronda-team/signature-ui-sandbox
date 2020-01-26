import * as React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import BlockSuite from './BlockSuite';

export default function ScrollStrategy() {
  // The `path` lets us build <Route> paths that are
  // relative to the parent route, while the `url` lets
  // us build relative links.
  let { path } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${path}/block`} component={BlockSuite} />
    </Switch>
  );
}
