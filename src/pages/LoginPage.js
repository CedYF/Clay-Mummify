import React, { useEffect, useState } from 'react';
import {
  generateMnemonicAndSeed,
  hasLockedMnemonicAndSeed,
  loadMnemonicAndSeed,
  mnemonicToSeed,
  storeMnemonicAndSeed,
} from '../utils/wallet-seed';
import {
  getAccountFromSeed,
  DERIVATION_PATH,
} from '../utils/walletProvider/localStorage.js';
import { useSolanaExplorerUrlSuffix } from '../utils/connection';
import Container from '@material-ui/core/Container';
import LoadingIndicator from '../components/LoadingIndicator';
import { BalanceListItem } from '../components/BalancesList.js';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { Typography } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { useCallAsync } from '../utils/notifications';
import Link from '@material-ui/core/Link';
import { validateMnemonic } from 'bip39';

export default function LoginPage() {
  const [restore, setRestore] = useState(false);

  React.useEffect(() => {

    if (typeof window !== "undefined") {

      setRestore(true)
      }
   
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <Container maxWidth="sm">
      {restore ? (
        <RestoreWalletForm goBack={() => setRestore(false)} />
      ) : (
        <>
          {hasLockedMnemonicAndSeed() ? <LoginForm /> : <CreateWalletForm />}
          <br />
          <Link style={{ cursor: 'pointer' }} onClick={() => setRestore(true)}>
            Restore existing wallet
          </Link>
        </>
      )}
    </Container>
  );
}

function CreateWalletForm() {
  const [mnemonicAndSeed, setMnemonicAndSeed] = useState(null);
  useEffect(() => {
    generateMnemonicAndSeed().then(setMnemonicAndSeed);
  }, []);
  const [savedWords, setSavedWords] = useState(false);
  const callAsync = useCallAsync();

  function submit(password) {
    const { mnemonic, seed } = mnemonicAndSeed;
    callAsync(
      storeMnemonicAndSeed(
        mnemonic,
        seed,
        password,
        DERIVATION_PATH.bip44Change,
      ),
      {
        progressMessage: 'Creating wallet...',
        successMessage: 'Wallet created',
      },
    );
  }

  if (!savedWords) {
    return (
      <SeedWordsForm
        mnemonicAndSeed={mnemonicAndSeed}
        goForward={() => setSavedWords(true)}
      />
    );
  }

  return (
    <ChoosePasswordForm
      mnemonicAndSeed={mnemonicAndSeed}
      goBack={() => setSavedWords(false)}
      onSubmit={submit}
    />
  );
}

function SeedWordsForm({ mnemonicAndSeed, goForward }) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Create New Wallet
        </Typography>
        <Typography paragraph>
          Create a new wallet to hold Solana and SPL tokens.
        </Typography>
        <Typography>
          Please write down the following twenty four words and keep them in a
          safe place:
        </Typography>
        {mnemonicAndSeed ? (
          <TextField
            variant="outlined"
            fullWidth
            multiline
            margin="normal"
            value={mnemonicAndSeed.mnemonic}
            label="Seed Words"
            onFocus={(e) => e.currentTarget.select()}
          />
        ) : (
          <LoadingIndicator />
        )}
        <Typography paragraph>
          Your private keys are only stored on your current computer or device.
          You will need these words to restore your wallet if your browser's
          storage is cleared or your device is damaged or lost.
        </Typography>
        <Typography paragraph>
          By default, sollet will use <code>m/44'/501'/0'/0'</code> as the
          derivation path for the main wallet. To use an alternative path, try
          restoring an existing wallet.
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={confirmed}
              disabled={!mnemonicAndSeed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
          }
          label="I have saved these words in a safe place."
        />
      </CardContent>
      <CardActions style={{ justifyContent: 'flex-end' }}>
        <Button color="primary" disabled={!confirmed} onClick={goForward}>
          Continue
        </Button>
      </CardActions>
    </Card>
  );
}

function ChoosePasswordForm({ goBack, onSubmit }) {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Choose a Password (Optional)
        </Typography>
        <Typography>
          Optionally pick a password to protect your wallet.
        </Typography>
        <TextField
          variant="outlined"
          fullWidth
          margin="normal"
          label="New Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          variant="outlined"
          fullWidth
          margin="normal"
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
        />
        <Typography>
          If you forget your password you will need to restore your wallet using
          your seed words.
        </Typography>
      </CardContent>
      <CardActions style={{ justifyContent: 'space-between' }}>
        <Button onClick={goBack}>Back</Button>
        <Button
          color="primary"
          disabled={password !== passwordConfirm}
          onClick={() => onSubmit(password)}
        >
          Create Wallet
        </Button>
      </CardActions>
    </Card>
  );
}

function LoginForm() {
  const [password, setPassword] = useState('');
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const callAsync = useCallAsync();

  function submit() {
    callAsync(loadMnemonicAndSeed(password, stayLoggedIn), {
      progressMessage: 'Unlocking wallet...',
      successMessage: 'Wallet unlocked',
    });
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Unlock Wallet
        </Typography>
        <TextField
          variant="outlined"
          fullWidth
          margin="normal"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={stayLoggedIn}
              onChange={(e) => setStayLoggedIn(e.target.checked)}
            />
          }
          label="Keep wallet unlocked"
        />
      </CardContent>
      <CardActions style={{ justifyContent: 'flex-end' }}>
        <Button color="primary" onClick={submit}>
          Unlock
        </Button>
      </CardActions>
    </Card>
  );
}

function RestoreWalletForm({ goBack }) {
  const [mnemonic, setMnemonic] = useState('');
  const [seed, setSeed] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [next, setNext] = useState(false);
  const isNextBtnEnabled =
    password === passwordConfirm && validateMnemonic(mnemonic);


    React.useEffect(() => {

      if (typeof window !== "undefined") {
        //localStorage.setItem("myMemo","Initial Test")
  
        //var tokenNames = '{"https://devnet.solana.com":{"Ag7fctgcBVsNHpPvDVbiRdr57PUnQEz7zM5J52Ethtmk":{"name":"Cedric Token Ag7f…htmk","symbol":"OWNAg"},"3UvtMQgMJA6opSLD6he8oBwuF7GV1aaGfp4ejZagSZrn":{"name":"Cedric Token 3Uvt…SZrn","symbol":"OWN3U"}}}'
        var unlocked = '{"mnemonic":"excite rose true bind machine cake alpha drift record example hockey brick under admit wild coconut uncover early have divorce toddler flame window option","seed":"51c4270b27d48afdcdb9220464568e0ceac2f185ecbca8c0593078dcbf15d764e3c5f2b200f5333a7dbf3d12854235861b51ead2c1460ac6f956c97dfbb2a529","derivationPath":"bip44Change"}'
        //var connectionEndpoint = '"https://devnet.solana.com"'
        setMnemonic(JSON.parse(unlocked)['mnemonic'])
        setSeed(JSON.parse(unlocked)['seed'])
        setNext(true)
        }
     
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  return (
    <>
      {next ? (
        <DerivedAccounts
          goBack={() => setNext(false)}
          mnemonic={mnemonic}
          password={password}
          seed={seed}
        />
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Restore Existing Wallet
            </Typography>
            <Typography>
              Restore your wallet using your twelve or twenty-four seed words. Note that this
              will delete any existing wallet on this device.
            </Typography>
            <TextField
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              margin="normal"
              label="Seed Words"
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
            />
            <TextField
              variant="outlined"
              fullWidth
              margin="normal"
              label="New Password (Optional)"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              variant="outlined"
              fullWidth
              margin="normal"
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </CardContent>
          <CardActions style={{ justifyContent: 'space-between' }}>
            <Button onClick={goBack}>Cancel</Button>
            <Button
              color="primary"
              disabled={!isNextBtnEnabled}
              onClick={() => {
                mnemonicToSeed(mnemonic).then((seed) => {
                  setSeed(seed);
                  setNext(true);
                });
              }}
            >
              Next
            </Button>
          </CardActions>
        </Card>
      )}
    </>
  );
}

function DerivedAccounts({ goBack, mnemonic, seed, password }) {
  const callAsync = useCallAsync();
  const urlSuffix = useSolanaExplorerUrlSuffix();
  const [dPathMenuItem, setDPathMenuItem] = useState(
    DerivationPathMenuItem.Bip44Change,
  );

  const accounts = [...Array(10)].map((_, idx) => {
    return getAccountFromSeed(
      Buffer.from(seed, 'hex'),
      idx,
      toDerivationPath(dPathMenuItem),
    );
  });

  function submit() {
    callAsync(
      storeMnemonicAndSeed(
        mnemonic,
        seed,
        password,
        toDerivationPath(dPathMenuItem),
      ),
    );
  }

 
  React.useEffect(() => {

    if (typeof window !== "undefined") {

      submit()
      } 
   
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card>
      <CardContent>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h5" gutterBottom>
            Derivable Accounts
          </Typography>
          <FormControl variant="outlined">
            <Select
              value={dPathMenuItem}
              onChange={(e) => setDPathMenuItem(e.target.value)}
            >
              <MenuItem value={DerivationPathMenuItem.Bip44Change}>
                {`m/44'/501'/0'/0'`}
              </MenuItem>
              <MenuItem value={DerivationPathMenuItem.Bip44}>
                {`m/44'/501'/0'`}
              </MenuItem>
              <MenuItem value={DerivationPathMenuItem.Deprecated}>
                {`m/501'/0'/0/0 (deprecated)`}
              </MenuItem>
            </Select>
          </FormControl>
        </div>
        {accounts.map((acc) => {
          return (
            <Link
              href={
                `https://explorer.solana.com/account/${acc.publicKey.toBase58()}` +
                urlSuffix
              }
              target="_blank"
              rel="noopener"
            >
              <BalanceListItem
                publicKey={acc.publicKey}
                walletAccount={acc}
                expandable={false}
              />
            </Link>
          );
        })}
      </CardContent>
      <CardActions style={{ justifyContent: 'space-between' }}>
        <Button onClick={goBack}>Back</Button>
        <Button color="primary" onClick={submit}>
          Restore
        </Button>
      </CardActions>
    </Card>
  );
}

// Material UI's Select doesn't render properly when using an `undefined` value,
// so we define this type and the subsequent `toDerivationPath` translator as a
// workaround.
//
// DERIVATION_PATH.deprecated is always undefined.
const DerivationPathMenuItem = {
  Deprecated: 0,
  Bip44: 1,
  Bip44Change: 2,
};

function toDerivationPath(dPathMenuItem) {
  switch (dPathMenuItem) {
    case DerivationPathMenuItem.Deprecated:
      return DERIVATION_PATH.deprecated;
    case DerivationPathMenuItem.Bip44:
      return DERIVATION_PATH.bip44;
    case DerivationPathMenuItem.Bip44Change:
      return DERIVATION_PATH.bip44Change;
    default:
      throw new Error(`invalid derivation path: ${dPathMenuItem}`);
  }
}