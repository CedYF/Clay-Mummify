import React from 'react';
import Container from '@material-ui/core/Container';
import BalancesList from '../components/BalancesList';
import Grid from '@material-ui/core/Grid';
import { useIsProdNetwork } from '../utils/connection';
// eslint-disable-next-line
import DebugButtons from '../components/DebugButtons';
import '../styles/index.css';
export default function WalletPage() {
  // eslint-disable-next-line
  const isProdNetwork = useIsProdNetwork();
  return (
    <Container fixed maxWidth="md">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <BalancesList />
        </Grid>
        {/* {isProdNetwork ? null : (
          <Grid item xs={12}>
            <DebugButtons />
          </Grid>
        )} */}
      </Grid>
    </Container>
  );
}
