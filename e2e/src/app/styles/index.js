import styled from 'styled-components';

export const Panel = styled.div`
  padding: 20px;
`;

export const SuiteContent = styled(Panel)`
`;

export const LogContent = styled(Panel)`
  background-color: #fafafa;
  font-family: monospace;
`;

export const SuiteRoot = styled.div`
  display: flex;
  align-items: flex-start;
  
  ${SuiteContent}, ${LogContent} {
    width: calc(50% - 16px);
  }
  
  ${SuiteContent} {
    margin-right: 16px;
  }
  
  ${LogContent} {
    margin-left: 16px;
  }
`;
