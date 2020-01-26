import React from 'react';
import { Button } from '../../src/lib/Button';
import { Icon, useIconRegistry } from '../../src/lib/Icon';
import { ButtonRow } from './styles';

export default function IconButtons() {
  const registry = useIconRegistry();

  React.useEffect(() => {
    registry.addSvgIconSetInNamespace('round', '/icons/icons.svg');
  }, []);

  return (
    <ButtonRow>
      <Button type="icon" color="primary">
        <Icon name="round:settings" />
      </Button>
      <Button type="icon" color="accent">
        <Icon name="round:calendar" />
      </Button>
    </ButtonRow>
  );
}
