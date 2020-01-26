import React from 'react';
import styled from 'styled-components';
import { SlideToggle } from '../../src/lib/SlideToggle';

const LabelText = styled.div`
  width: 200px;
`;

const ControlLine = styled.div`
  display: block;
`;

export default function Overview() {
  const [showFavorites, setShowFavorites] = React.useState(false);
  const [adjustBrightnessAuto, setAdjustBrightnessAuto] = React.useState(false);
  const [useWifi, setUseWifi] = React.useState(false);

  const onChangeChecked = React.useCallback((event) => {
    const { checked, name } = event.target;
    switch (name) {
      case 'favorites':
        setShowFavorites(checked);
        break;
      case 'brightness':
        setAdjustBrightnessAuto(checked);
        break;
      case 'wifi':
        setUseWifi(checked);
        break;
      default: break;
    }
  }, [setShowFavorites, setAdjustBrightnessAuto, setUseWifi]);

  return (
    <React.Fragment>
      <ControlLine>
        <SlideToggle name="favorites" checked={showFavorites} onChange={onChangeChecked} labelPosition="before">
          <LabelText>Show the favorites bar</LabelText>
        </SlideToggle>
      </ControlLine>
      <ControlLine>
        <SlideToggle name="brightness" checked={adjustBrightnessAuto} onChange={onChangeChecked} labelPosition="before">
          <LabelText>Auto-brightness</LabelText>
        </SlideToggle>
      </ControlLine>
      <ControlLine>
        <SlideToggle name="wifi" checked={useWifi} onChange={onChangeChecked} labelPosition="before">
          <LabelText>Wi-Fi</LabelText>
        </SlideToggle>
      </ControlLine>
    </React.Fragment>
  );
}
