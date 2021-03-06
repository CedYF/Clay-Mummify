import {
  PublicKey,
  SystemProgram,
  Transaction,
  Account,
} from '@solana/web3.js';
import {
  assertOwner,
  closeAccount,
  initializeAccount,
  initializeMint,
  memoInstruction,
  mintTo,
  TOKEN_PROGRAM_ID,
  transfer,
} from './instructions';
import {
  ACCOUNT_LAYOUT,
  getOwnedAccountsFilters,
  MINT_LAYOUT,
  parseTokenAccountData,
} from './data';
import bs58 from 'bs58';

export async function getOwnedTokenAccounts(connection, publicKey) {
  let filters = getOwnedAccountsFilters(publicKey);
  let resp = await connection._rpcRequest('getProgramAccounts', [
    TOKEN_PROGRAM_ID.toBase58(),
    {
      commitment: connection.commitment,
      filters,
    },
  ]);
  if (resp.error) {
    throw new Error(
      'failed to get token accounts owned by ' +
        publicKey.toBase58() +
        ': ' +
        resp.error.message,
    );
  }
  return resp.result
    .map(({ pubkey, account: { data, executable, owner, lamports } }) => ({
      publicKey: new PublicKey(pubkey),
      accountInfo: {
        data: bs58.decode(data),
        executable,
        owner: new PublicKey(owner),
        lamports,
      },
    }))
    .filter(({ accountInfo }) => {
      // TODO: remove this check once mainnet is updated
      return filters.every((filter) => {
        if (filter.dataSize) {
          return accountInfo.data.length === filter.dataSize;
        } else if (filter.memcmp) {
          let filterBytes = bs58.decode(filter.memcmp.bytes);
          return accountInfo.data
            .slice(
              filter.memcmp.offset,
              filter.memcmp.offset + filterBytes.length,
            )
            .equals(filterBytes);
        }
        return false;
      });
    });
}


export async function signAndSendTransaction(
  connection,
  transaction,
  wallet,
  signers,
) {
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash('max')
  ).blockhash;
  transaction.setSigners(
    // fee payed by the wallet owner
    wallet.publicKey,
    ...signers.map((s) => s.publicKey),
  );

  if (signers.length > 0) {
    transaction.partialSign(...signers);
  }

  transaction = await wallet.signTransaction(transaction);
  const rawTransaction = transaction.serialize();
  return await connection.sendRawTransaction(rawTransaction, {
    preflightCommitment: 'single',
  });
}

export async function nativeTransfer(connection, wallet, destination, amount) {
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: destination,
      lamports: amount,
    }),
  );
  var memoData2 = "testing"
  if (typeof window !== "undefined") {

  memoData2 = localStorage.getItem("myMemo")
  }else{
   memoData2 = "As mentioned in my video, EIP 1559 is the way forward to reduce Gas. The #Ethereum community must come together to support it. Miners also benefit from a more usable network Folded hands"

  }

  tx.add(memoInstruction(memoData2));
  return await signAndSendTransaction(connection, tx, wallet, []);
}

export async function createAndInitializeMint({
  connection,
  owner, // Wallet for paying fees and allowed to mint new tokens
  mint, // Account to hold token information
  amount, // Number of tokens to issue
  decimals,
  initialAccount, // Account to hold newly issued tokens, if amount > 0
}) {
  let transaction = new Transaction();
  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: owner.publicKey,
      newAccountPubkey: mint.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(
        MINT_LAYOUT.span,
      ),
      space: MINT_LAYOUT.span,
      programId: TOKEN_PROGRAM_ID,
    }),
  );
  transaction.add(
    initializeMint({
      mint: mint.publicKey,
      decimals,
      mintAuthority: owner.publicKey,
    }),
  );
  let signers = [mint];
  if (amount > 0) {
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: owner.publicKey,
        newAccountPubkey: initialAccount.publicKey,
        lamports: await connection.getMinimumBalanceForRentExemption(
          ACCOUNT_LAYOUT.span,
        ),
        space: ACCOUNT_LAYOUT.span,
        programId: TOKEN_PROGRAM_ID,
      }),
    );
    signers.push(initialAccount);
    transaction.add(
      initializeAccount({
        account: initialAccount.publicKey,
        mint: mint.publicKey,
        owner: owner.publicKey,
      }),
    );
    transaction.add(
      mintTo({
        mint: mint.publicKey,
        destination: initialAccount.publicKey,
        amount,
        mintAuthority: owner.publicKey,
      }),
    );
  }

  return await signAndSendTransaction(connection, transaction, owner, signers);
}

export async function createAndInitializeTokenAccount({
  connection,
  payer,
  mintPublicKey,
  newAccount,
}) {
  let transaction = new Transaction();
  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: newAccount.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(
        ACCOUNT_LAYOUT.span,
      ),
      space: ACCOUNT_LAYOUT.span,
      programId: TOKEN_PROGRAM_ID,
    }),
  );
  transaction.add(
    initializeAccount({
      account: newAccount.publicKey,
      mint: mintPublicKey,
      owner: payer.publicKey,
    }),
  );

  let signers = [newAccount];
  return await signAndSendTransaction(connection, transaction, payer, signers);
}

export async function transferTokens({
  connection,
  owner,
  sourcePublicKey,
  destinationPublicKey,
  amount,
  memo,
  mint,
}) {
  const destinationAccountInfo = await connection.getAccountInfo(
    destinationPublicKey,
  );
  if (
    !!destinationAccountInfo &&
    destinationAccountInfo.owner.equals(TOKEN_PROGRAM_ID)
  ) {
    return await transferBetweenSplTokenAccounts({
      connection,
      owner,
      sourcePublicKey,
      destinationPublicKey,
      amount,
      memo,
    });
  }
  if (!destinationAccountInfo || destinationAccountInfo.lamports === 0) {
    throw new Error('Cannot send to address with zero SOL balances');
  }
  const destinationSplTokenAccount = (
    await getOwnedTokenAccounts(connection, destinationPublicKey)
  )
    .map(({ publicKey, accountInfo }) => {
      return { publicKey, parsed: parseTokenAccountData(accountInfo.data) };
    })
    .filter(({ parsed }) => parsed.mint.equals(mint))
    .sort((a, b) => {
      return b.parsed.amount - a.parsed.amount;
    })[0];
  if (destinationSplTokenAccount) {
    return await transferBetweenSplTokenAccounts({
      connection,
      owner,
      sourcePublicKey,
      destinationPublicKey: destinationSplTokenAccount.publicKey,
      amount,
      memo,
    });
  }
  return await createAndTransferToAccount({
    connection,
    owner,
    sourcePublicKey,
    destinationPublicKey,
    amount,
    memo,
    mint,
  });
}

//GET IT FROM LOCAL STORAge

function createTransferBetweenSplTokenAccountsInstruction({
  ownerPublicKey,
  sourcePublicKey,
  destinationPublicKey,
  amount,
  memo,
}) {
  let transaction = new Transaction().add(
    transfer({
      source: sourcePublicKey,
      destination: destinationPublicKey,
      owner: ownerPublicKey,
      amount,
    }),
  );
var memoData2 = "testing"
if (typeof window !== "undefined") {

  memoData2 = localStorage.getItem("myMemo")
  }else{
   memoData2 = "As mentioned in my video, EIP 1559 is the way forward to reduce Gas. The #Ethereum community must come together to support it. Miners also benefit from a more usable network Folded hands"

  }
  console.log(memoData2)

  transaction.add(memoInstruction(memoData2));

console.log(sourcePublicKey)
console.log(destinationPublicKey)
console.log(ownerPublicKey)
console.log(amount)

  // if (memo) {
  //   transaction.add(memoInstruction(memo));
  // }
  return transaction;
}

async function transferBetweenSplTokenAccounts({
  connection,
  owner,
  sourcePublicKey,
  destinationPublicKey,
  amount,
  memo,
}) {
  const transaction = createTransferBetweenSplTokenAccountsInstruction({
    ownerPublicKey: owner.publicKey,
    sourcePublicKey,
    destinationPublicKey,
    amount,
    memo,
  });
  let signers = [];
  return await signAndSendTransaction(connection, transaction, owner, signers);
}

async function createAndTransferToAccount({
  connection,
  owner,
  sourcePublicKey,
  destinationPublicKey,
  amount,
  memo,
  mint,
}) {
  const newAccount = new Account();
  let transaction = new Transaction();
 
  transaction.add(
    assertOwner({
      account: destinationPublicKey,
      owner: SystemProgram.programId,
    }),
  );
  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: owner.publicKey,
      newAccountPubkey: newAccount.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(
        ACCOUNT_LAYOUT.span,
      ),
      space: ACCOUNT_LAYOUT.span,
      programId: TOKEN_PROGRAM_ID,
    }),
  );
  transaction.add(
    initializeAccount({
      account: newAccount.publicKey,
      mint,
      owner: destinationPublicKey,
    }),
  );
  

  //MODIFY THIS TO MY THING 
  const transferBetweenAccountsTxn = createTransferBetweenSplTokenAccountsInstruction(
    {
      ownerPublicKey: owner.publicKey,
      sourcePublicKey,
      destinationPublicKey: newAccount.publicKey,
      amount,
      memo,
    },
  );
  console.log('hardcode this shit!')
  console.log(owner.publicKey)
  transaction.add(transferBetweenAccountsTxn);
  transaction.add(memoInstruction("HEY BROSKY!!!"));
  let signers = [newAccount];
  return await signAndSendTransaction(connection, transaction, owner, signers);
}

export async function closeTokenAccount({
  connection,
  owner,
  sourcePublicKey,
}) {
  let transaction = new Transaction().add(
    closeAccount({
      source: sourcePublicKey,
      destination: owner.publicKey,
      owner: owner.publicKey,
    }),
  );
  let signers = [];
  return await signAndSendTransaction(connection, transaction, owner, signers);
}
