import React, { useState } from 'react';
import { useSnackbar } from 'notistack';
import { useConnection, useSolanaExplorerUrlSuffix } from './connection';
import Button from '@material-ui/core/Button';
import { confirmTransaction } from './utils';

export function useSendTransaction(text) {
  const connection = useConnection();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [sending, setSending] = useState(false);

  async function sendTransaction(
    signaturePromise,
    { onSuccess, onError } = {},
  ) {
    let id = enqueueSnackbar('Sending transaction...', {
      variant: 'info',
      persist: true,
    });
    setSending(true);
    try {
      let signature = await signaturePromise;
      closeSnackbar(id);
      id = enqueueSnackbar('Confirming transaction...', {
        variant: 'info',
        persist: true,
        action: <ViewTransactionOnExplorerButton signature={signature} />,
      });
      await confirmTransaction(connection, signature);
      console.log(signature)
      console.log("THIS IS THE TEXT:")
   
      if (process.browser) {
        console.log(localStorage.getItem("myMemo"));
        localStorage.setItem("signature", signature);
        
     }
     
      closeSnackbar(id);
      setSending(false);
      enqueueSnackbar('Transaction confirmed', {
        variant: 'success',
        autoHideDuration: 15000,
        action: <ViewTransactionOnExplorerButton signature={signature} />,
      });
      if (onSuccess) {
        onSuccess(signature);
      }
    } catch (e) {
      closeSnackbar(id);
      setSending(false);
      console.warn(e.message);
      enqueueSnackbar(e.message, { variant: 'error' });
      if (onError) {
        onError(e);
      }
    }
  }

  return [sendTransaction, sending];
}

function ViewTransactionOnExplorerButton({ signature }) {


  const urlSuffix = useSolanaExplorerUrlSuffix();
  console.log(`https://explorer.solana.com/tx/${signature}` + urlSuffix)
  console.log(signature)
  return (
    <Button
      color="inherit"
      component="a"
      target="_blank"
      rel="noopener"
      href={`https://explorer.solana.com/tx/${signature}` + urlSuffix}
    >
      View on Solana Explorer
    </Button>
  );
}

export function useCallAsync() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  return async function callAsync(
    promise,
    {
      progressMessage = 'Submitting...',
      successMessage = 'Success',
      onSuccess,
      onError,
    } = {},
  ) {
    let id = enqueueSnackbar(progressMessage, {
      variant: 'info',
      persist: true,
    });
    try {
      let result = await promise;
      closeSnackbar(id);
      if (successMessage) {
        enqueueSnackbar(successMessage, { variant: 'success' });
      }
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (e) {
      console.warn(e);
      closeSnackbar(id);
      enqueueSnackbar(e.message, { variant: 'error' });
      if (onError) {
        onError(e);
      }
    }
  };
}
