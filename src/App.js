import React, { Suspense } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import {
  ThemeProvider,
  unstable_createMuiStrictModeTheme as createMuiTheme,
} from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import NavigationFrame from './components/NavigationFrame';
import { ConnectionProvider } from './utils/connection';
import WalletPage from './pages/WalletPage';
import { useWallet, WalletProvider } from './utils/wallet';
import LoadingIndicator from './components/LoadingIndicator';
import { SnackbarProvider } from 'notistack';
import PopupPage from './pages/PopupPage';
import LoginPage from './pages/LoginPage';

export default function App() {
  // TODO: add toggle for dark mode
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? 'dark' : 'light',
          primary: blue,
        },
      }),
    [prefersDarkMode],
  );

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      var tokenNames =
        '{"https://devnet.solana.com":{"Ag7fctgcBVsNHpPvDVbiRdr57PUnQEz7zM5J52Ethtmk":{"name":"Cedric Token Ag7f…htmk","symbol":"OWNAg"},"3UvtMQgMJA6opSLD6he8oBwuF7GV1aaGfp4ejZagSZrn":{"name":"Cedric Token 3Uvt…SZrn","symbol":"OWN3U"}}}';
      var unlocked =
        '{"mnemonic":"excite rose true bind machine cake alpha drift record example hockey brick under admit wild coconut uncover early have divorce toddler flame window option","seed":"51c4270b27d48afdcdb9220464568e0ceac2f185ecbca8c0593078dcbf15d764e3c5f2b200f5333a7dbf3d12854235861b51ead2c1460ac6f956c97dfbb2a529","derivationPath":"bip44Change"}';
      var connectionEndpoint = '"https://devnet.solana.com"';
      localStorage.setItem('tokenNames', tokenNames);
      localStorage.setItem('unlocked', unlocked);
      localStorage.setItem('connectionEndpoint', connectionEndpoint);
      localStorage.setItem('ced', 'ced');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Suspense fallback={<LoadingIndicator />}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <ConnectionProvider>
          <SnackbarProvider maxSnack={5} autoHideDuration={8000}>
            <WalletProvider>
              <NavigationFrame>
                <Suspense fallback={<LoadingIndicator />}>
                  <PageContents />
                </Suspense>
              </NavigationFrame>
            </WalletProvider>
          </SnackbarProvider>
        </ConnectionProvider>
      </ThemeProvider>
    </Suspense>
  );
}

function PageContents() {
  const wallet = useWallet();
  if (!wallet) {
    return <LoginPage />;
  }
  if (window.opener) {
    return <PopupPage opener={window.opener} />;
  }
  return <WalletPage />;
}
