import React, { useState } from 'react';
import List from '@material-ui/core/List';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

// eslint-disable-next-line
import ListItem from '@material-ui/core/ListItem';
// eslint-disable-next-line
import ListItemText from '@material-ui/core/ListItemText';
// eslint-disable-next-line
import Paper from '@material-ui/core/Paper';
import {
  // refreshWalletPublicKeys,
  useBalanceInfo,
  useWallet,
  useWalletPublicKeys,
  useWalletSelector,
} from '../utils/wallet';
// eslint-disable-next-line
import { TextareaAutosize } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import LoadingIndicator from './LoadingIndicator';
import Collapse from '@material-ui/core/Collapse';
import { Typography } from '@material-ui/core';
import TokenInfoDialog from './TokenInfoDialog';
import Link from '@material-ui/core/Link';
// eslint-disable-next-line
import ExpandLess from '@material-ui/icons/ExpandLess';
// eslint-disable-next-line
import ExpandMore from '@material-ui/icons/ExpandMore';
import { makeStyles } from '@material-ui/core/styles';
// eslint-disable-next-line
import { abbreviateAddress } from '../utils/utils';
import Button from '@material-ui/core/Button';
import SendIcon from '@material-ui/icons/Send';
import ReceiveIcon from '@material-ui/icons/WorkOutline';
import DeleteIcon from '@material-ui/icons/Delete';
// eslint-disable-next-line
import AppBar from '@material-ui/core/AppBar';
// eslint-disable-next-line
import Toolbar from '@material-ui/core/Toolbar';
// eslint-disable-next-line
import AddIcon from '@material-ui/icons/Add';
// eslint-disable-next-line
import RefreshIcon from '@material-ui/icons/Refresh';
// eslint-disable-next-line
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/InfoOutlined';
// eslint-disable-next-line
import Tooltip from '@material-ui/core/Tooltip';
// eslint-disable-next-line
import EditIcon from '@material-ui/icons/Edit';
import AddTokenDialog from './AddTokenDialog';
import ExportAccountDialog from './ExportAccountDialog';
import SendDialog from './SendDialog';
import DepositDialog from './DepositDialog';
import {
  // refreshAccountInfo,
  useSolanaExplorerUrlSuffix,
} from '../utils/connection';
import { showTokenInfoDialog } from '../utils/config';
import CloseTokenAccountDialog from './CloseTokenAccountButton';
// eslint-disable-next-line
import ListItemIcon from '@material-ui/core/ListItemIcon';
// eslint-disable-next-line
import TokenIcon from './TokenIcon';
import EditAccountNameDialog from './EditAccountNameDialog';

// const balanceFormat = new Intl.NumberFormat(undefined, {
//   minimumFractionDigits: 4,
//   maximumFractionDigits: 4,
//   useGrouping: true,
// });

export default function BalancesList() {
  // const wallet = useWallet();
  const [publicKeys, loaded] = useWalletPublicKeys();
  const [showAddTokenDialog, setShowAddTokenDialog] = useState(false);
  const [showEditAccountNameDialog, setShowEditAccountNameDialog] = useState(
    false,
  );
  const { accounts, setAccountName } = useWalletSelector();
  const selectedAccount = accounts.find((a) => a.isSelected);
  const [recentTexts, setRecentTexts] = useState(["demo"]);
  const [value, setValue] = useState(0);

  const [allTexts, setAllTexts] = useState([]);
  var copyText = [].concat(recentTexts)
  console.log(allTexts)

  React.useEffect(()=>{
  
    if (process.browser) {
      var history = localStorage.getItem("history")
          if(history !== "undefined"){
            setAllTexts(JSON.parse(history))
          }
      
        }
  },[])

  
   


   React.useEffect(()=>{

    setTimeout(function () {
      
         
      if (process.browser && value >0) {
        var item = {text:localStorage.getItem("myMemo"),sig:localStorage.getItem("signature")}
       
        //setAllTexts([item].concat(copyText))
        // setAllTexts(state => ({...state, [item])});
        //setAllTexts(state => ({ ...state, a: [item] }));
        

        setAllTexts(state => [item].concat(state));
        
        var history = localStorage.getItem("history")
        if(history !== "undefined"){
          
          
          localStorage.setItem("history", JSON.stringify(([item].concat(JSON.parse(history)))));
        }else{
          console.log(history)
          history = []
          localStorage.setItem("history", JSON.stringify([item]));
         
        }
        
       }
    
}, 3000);
  
      

   },[value])


  
  
  return (
    <div >
    <div className="mt-10 mainBox rounded shadow-md" >
     
        {/* 
         <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }} component="h2">
            {selectedAccount && selectedAccount.name} Balances
          </Typography>
          {selectedAccount &&
            selectedAccount.name !== 'Main account' &&
            selectedAccount.name !== 'Hardware wallet' && (
              <Tooltip title="Edit Account Name" arrow>
                <IconButton onClick={() => setShowEditAccountNameDialog(true)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
          <Tooltip title="Add Token" arrow>
            <IconButton onClick={() => setShowAddTokenDialog(true)}>
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh" arrow>
            <IconButton
              onClick={() => {
                refreshWalletPublicKeys(wallet);
                publicKeys.map((publicKey) =>
                  refreshAccountInfo(wallet.connection, publicKey, true),
                );
              }}
              style={{ marginRight: -12 }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
        </AppBar>
        */}
      
      <List disablePadding>
      <BalanceListItem sValue={setValue} texts={copyText} recent={setRecentTexts} key={publicKeys[0].toBase58()} publicKey={publicKeys[0]} />
        {/* {publicKeys.slice(0).map((publicKey) => (
          
        ))} */}
        {loaded ? null : null}
      </List>
      <AddTokenDialog
        open={showAddTokenDialog}
        onClose={() => setShowAddTokenDialog(false)}
      />
      <EditAccountNameDialog
        open={showEditAccountNameDialog}
        onClose={() => setShowEditAccountNameDialog(false)}
        oldName={selectedAccount ? selectedAccount.name : ''}
        onEdit={(name) => {
          setAccountName(selectedAccount.selector, name);
          setShowEditAccountNameDialog(false);
        }}
      />
    </div>

<div>
<h2 className="mb-4 font-bold mt-6 md:mt-6 text-gray-600 text-xl md:text-3xl flex flex-row items-center ">
           FAQ<img className="ml-2 w-8 h-8" alt="pyramid" src="/tablet2.png"></img>
            </h2>

<Accordion style={{backgroundColor:"#FDF3C7", border:"unset",boxShadow:"var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);"}} >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <div className="font-semibold">How Does It Work?</div>
 
        </AccordionSummary>
        <AccordionDetails>
          <div>
            Mummify permanently inscribes your text into the blockchain. Never get your text deleted again! <br></br>It uses the <a className="hover:underline underline hover:text-blue-500" href="https://spl.solana.com/memo">Solana Blockchain Memo Program</a> to inscribe your text into a transaction. When you click "See on chain", scroll down and you'll see that a memo of your text is included with the transaction. All transactions are in the dev network and are simply sending SOL to and from the same wallet.
          </div>
        </AccordionDetails>
        
      </Accordion>
      <Accordion style={{backgroundColor:"#FDF3C7", border:"unset",boxShadow:"var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);"}} >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <div className="font-semibold">Why Mummify?</div>
 
        </AccordionSummary>
        <AccordionDetails>
          <div>
            The hieroglyphics from the Egyptian era is still with us today. Mainly, because pyramids and their writing were made in stone and that last forever... The same concept applies to blockchain. So as long as you keep the transaction url, you'll have your writing saved forever. No one can ever delete it!
          </div>
        </AccordionDetails>
        
      </Accordion>
      <Accordion style={{backgroundColor:"#FDF3C7", border:"unset",boxShadow:"var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);"}} >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3a-content"
          id="panel3a-header"
        >
          <div className="font-medium">How did you build this?</div>
 
        </AccordionSummary>
        <AccordionDetails>
          <div>
            This is a fork of the <a className="hover:underline hover:text-blue-500 underline"  href="https://github.com/project-serum/spl-token-wallet">spl token wallet </a> and it's been modified so it can only send internal transactions that also include memos. Full source code coming soon! We use React + TailwindCSS and host with Next JS. Built by Ed + <a className="hover:underline hover:text-blue-500 underline"  href="https://twitter.com/cedyarish">Ced</a>
          </div>
        </AccordionDetails>
        
      </Accordion>

</div>


  <h2 className="font-bold mt-6 md:mt-6 text-gray-600 text-xl md:text-3xl flex flex-row items-center ">Your Saved Text <img className="ml-2 w-8 h-8" alt="pyramid" src="/pyramids.png"></img></h2>
 
<div className="grid grid-cols-2 md:grid-cols-3">
  {allTexts && allTexts !== null && allTexts.length > 0 && allTexts.map(l=>{
    if(l !== null){
      return <a target="_blank" rel="noreferrer" href={"https://explorer.solana.com/tx/"+l.sig+"?cluster=devnet"}>
        <div className="rounded-2xl cursor-pointer shadow-sm hover:shadow-xl m-1 md:m-1 flex flex-col bg-yellow-100 p-2 md:p-5">
        <div className="font-bold text-md md:text-xl ">{l.text}</div>
        <a className="hover:underline hover:text-blue-500 text-xs" target="_blank" rel="noreferrer" href={"https://explorer.solana.com/tx/"+l.sig+"?cluster=devnet"}>See on chain</a>
        </div>
        </a>

    }else{
      return null
    }
      })}
      </div>
  </div>
  );
}

const useStyles = makeStyles((theme) => ({
  address: {
    textOverflow: 'ellipsis',
    overflowX: 'hidden',
  },
  itemDetails: {
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-evenly',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

export function BalanceListItem({ publicKey, expandable,recent,texts, sValue}) {
  const balanceInfo = useBalanceInfo(publicKey);
  // const classes = useStyles();
  // const [open, setOpen] = useState(true);
  expandable = expandable === undefined ? true : expandable;

  if (!balanceInfo) {
    return <LoadingIndicator delay={0} />;
  }

  // let { amount, decimals, mint, tokenName, tokenSymbol } = balanceInfo;

  return (
    <>
      {/* <ListItem button onClick={() => expandable && setOpen((open) => !open)}>
        <ListItemIcon>
          <TokenIcon mint={mint} tokenName={tokenName} size={28} />
        </ListItemIcon>
        <ListItemText
          primary={
            <>
              {balanceFormat.format(amount / Math.pow(10, decimals))}{' '}
              {tokenName ?? abbreviateAddress(mint)}
              {tokenSymbol ? ` (${tokenSymbol})` : null}
            </>
          }
          secondary={publicKey.toBase58()}
          secondaryTypographyProps={{ className: classes.address }}
        />
        {expandable ? open ? <ExpandLess /> : <ExpandMore /> : <></>}
      </ListItem> */}
      <Collapse in={true} timeout="auto" unmountOnExit>
        <BalanceListItemDetails
        vValue={sValue}
          publicKey={publicKey}
          balanceInfo={balanceInfo}
          therecent={recent}
          theTexts={texts}
        />
      </Collapse>
    </>
  );
}

function BalanceListItemDetails({ publicKey, balanceInfo,therecent,theTexts,vValue }) {
  const urlSuffix = useSolanaExplorerUrlSuffix();
  const classes = useStyles();
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [myMemo, setMyMemo] = useState("");
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  
  const [tokenInfoDialogOpen, setTokenInfoDialogOpen] = useState(false);
  const [exportAccDialogOpen, setExportAccDialogOpen] = useState(false);
  const [
    closeTokenAccountDialogOpen,
    setCloseTokenAccountDialogOpen,
  ] = useState(false);
  const wallet = useWallet();

  if (!balanceInfo) {
    return <LoadingIndicator delay={0} />;
  }

  let { mint, tokenName, tokenSymbol, owner, amount } = balanceInfo;

  // Only show the export UI for the native SOL coin.
  const exportNeedsDisplay =
    mint === null && tokenName === 'SOL' && tokenSymbol === 'SOL';

function saveMemo(theMemo) {
  if (typeof window !== "undefined") {
    localStorage.setItem("myMemo",theMemo)
    console.log(localStorage.getItem("myMemo"))
    }
  }
 
  



  return (

    <div >
      <div className="flex p-4 justify-center flex-col align-center items-center">
        <h1 className="font-bold  text-xl md:text-2xl  flex flex-row justify-center items-center">Mummify your text <img alt="tablet" className="pl-1 w-6 h-6" src="/tablet.png"/></h1>
        <h2 className="font-semibold text-gray-600 text-lg md:text-lg pb-4 flex flex-row justify-center items-center ">Scribe your thoughts into the blockchain </h2>
        <form className="rounded w-full md:w-3/5" onSubmit={(e)=>{setSendDialogOpen(true);saveMemo(myMemo);vValue(Math.random());therecent([myMemo].concat(theTexts));console.log('save text');console.log(myMemo); e.preventDefault();}} noValidate autoComplete="off">
        
            <TextField fullWidth={true} className="w-90 bg-white mb-5 pb-10" value={myMemo}
            onChange={(e) => {setMyMemo(e.target.value);}} id="outlined-basic" label="Etch your text" placeholder="Enter text" variant="outlined" />
          </form>
          <div  className="pt-5">
          <Button 
         
      
            variant="contained"
            color="primary"
            endIcon={<SendIcon />}
            onClick={() => {setSendDialogOpen(true);saveMemo(myMemo);vValue(Math.random());therecent([myMemo].concat(theTexts));console.log('save text');console.log(myMemo)}}
          >
            Save To Solana Blockchain
          </Button>
          </div>
        </div>

      {wallet.allowsExport && (
        <ExportAccountDialog
          onClose={() => setExportAccDialogOpen(false)}
          open={exportAccDialogOpen}
        />
      )}
      <div className={classes.itemDetails}>
        <div className={classes.buttonContainer}>
          {!publicKey.equals(owner) && showTokenInfoDialog ? (
            <Button
              variant="outlined"
              color="default"
              startIcon={<InfoIcon />}
              onClick={() => setTokenInfoDialogOpen(true)}
            >
              Token Info
            </Button>
          ) : null}
          <Button
          style={{display:"none"}}
            variant="outlined"
            color="primary"
            startIcon={<ReceiveIcon />}
            onClick={() => setDepositDialogOpen(true)}
          >
            Receive
          </Button>
       
          
          {mint && amount === 0 ? (
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={() => setCloseTokenAccountDialogOpen(true)}
            >
              Delete
            </Button>
          ) : null}
        </div>
        <div style={{display:"none"}}>
        <Typography variant="body2" className={classes.address}>
          Deposit Address: {publicKey.toBase58()}
        </Typography>
        <Typography variant="body2">
          Token Name: {tokenName ?? 'Unknown'}
        </Typography>
        <Typography variant="body2">
          Token Symbol: {tokenSymbol ?? 'Unknown'}
        </Typography>
        {mint ? (
          <Typography variant="body2" className={classes.address}>
            Token Address: {mint.toBase58()}
          </Typography>
        ) : null}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{marginTop:"30px"}}>
            <Typography variant="body2">
              <Link
                href={
                  `https://explorer.solana.com/account/${publicKey.toBase58()}` +
                  urlSuffix
                }
                target="_blank"
                rel="noreferrer"
                // rel="noopener"
              >
                View on Solana Explorer
              </Link>
            </Typography>
          </div>
          {exportNeedsDisplay && wallet.allowsExport && (
            <div style={{display:"none"}} >
              <Typography variant="body2">
                <Link href={'#'} onClick={(e) => setExportAccDialogOpen(true)}>
                  Export
                </Link>
              </Typography>
            </div>
          )}
        </div>
      </div>
      <SendDialog
        myTransactions = {"my transactions"}
        text={myMemo}
        open={sendDialogOpen}
        onClose={() => setSendDialogOpen(false)}
        balanceInfo={balanceInfo}
        publicKey={publicKey}
      />
      <DepositDialog
        open={depositDialogOpen}
        onClose={() => setDepositDialogOpen(false)}
        balanceInfo={balanceInfo}
        publicKey={publicKey}
      />
      <TokenInfoDialog
        open={tokenInfoDialogOpen}
        onClose={() => setTokenInfoDialogOpen(false)}
        balanceInfo={balanceInfo}
        publicKey={publicKey}
      />
      <CloseTokenAccountDialog
        open={closeTokenAccountDialogOpen}
        onClose={() => setCloseTokenAccountDialogOpen(false)}
        balanceInfo={balanceInfo}
        publicKey={publicKey}
      />
    </div>
  );
}
