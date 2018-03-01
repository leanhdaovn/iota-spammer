const txList = [];

const port = chrome.extension.connect({
  name: "Sample Communication"
});

const spamStartBtn = document.getElementById('spam-start-btn');
spamStartBtn.onclick = e => {
  port.postMessage({ type: 'START_SPAM'});
};

const spamStopBtn = document.getElementById('spam-stop-btn');
spamStopBtn.onclick = e => {
  port.postMessage({ type: 'STOP_SPAM'});
};

const spamClearBtn = document.getElementById('spam-clear-btn');
spamClearBtn.onclick = e => {
  chrome.storage.local.remove('spamTransactions', function (result) {
    showTransactions();
  })
};

const promoteStartBtn = document.getElementById('promote-start-btn');
promoteStartBtn.onclick = e => {
  const txHash = document.getElementById('tx-hash-input').value;
  port.postMessage({ 
    type: 'START_PROMOTING', 
    payload: {
      transactionHash: txHash
    }
  });
};

const promoteStopBtn = document.getElementById('promote-stop-btn');
promoteStopBtn.onclick = e => {
  port.postMessage({ 
    type: 'STOP_PROMOTING'
  });
};

const displaySpammingStatus = () => {
  const spammingStatusElement = document.getElementById('spamming-status');
  chrome.storage.local.get({ spamming: false }, ({ spamming }) => {
    spammingStatusElement.innerHTML = spamming ? 'spamming' : 'not spamming';
    if (spamming) {
      spamStartBtn.disabled = true;
      spamStopBtn.disabled = false;
    } else {
      spamStartBtn.disabled = false;
      spamStopBtn.disabled = true;
    }
  });
};

const promoteStatusElement = document.getElementById('promote-status');
const promoteErrorElement = document.getElementById('promote-error');
const promoteTxnCountElement = document.getElementById('promote-txn-count');

const displayPromoteState = () => {
  const txHashInput = document.getElementById('tx-hash-input');
  getPromoteState(promoteState => {
    if (promoteState.working) {
      txnUrl = `https://thetangle.org/transaction/${promoteState.originalTransaction}`;
      promoteStatusElement.innerHTML = `Promoting transaction <a href="${txnUrl}">${promoteState.originalTransaction}</a>`;
      promoteTxnCountElement.innerHTML = `Created ${promoteState.transactions.length} transactions`;
      promoteStartBtn.disabled = true;
      promoteStopBtn.disabled = false;
      txHashInput.disabled = true;
      promoteErrorElement.innerHTML = null;
    } else {
      promoteStatusElement.innerHTML = '';
      promoteTxnCountElement.innerHTML = '';
      promoteStartBtn.disabled = false;
      promoteStopBtn.disabled = true;
      txHashInput.disabled = false;
      promoteErrorElement.innerHTML = promoteState.errorMessage;
    }
  });
};

displaySpammingStatus();
displayPromoteState();

setInterval(() => {
  displaySpammingStatus();
  displayPromoteState();
}, 100);

// const displayTransactions = (transactions) => {
//   const sortedTxs = transactions.sort((tx1, tx2) => (tx2.timestamp - tx1.timestamp));

//   const txListEle = document.getElementById('tx-list');
//   const txListRows = sortedTxs.map(tx => {
//     const time = new Date(tx.timestamp);
//     return `
//     <tr>
//       <td class="mdl-data-table__cell--non-numeric">${time.toLocaleString()}</td>
//       <td class="mdl-data-table__cell--non-numeric"><a href="https://thetangle.org/transaction/${tx.hash}">${tx.hash.substr(0, 40)}...</a></td>
//     </tr>
//     `;
//   });
//   txListEle.innerHTML = txListRows.join('');
// };

// const loadTransactions = () => new Promise((resolve, reject) => {
//   chrome.storage.local.get({spamTransactions: []}, function (result) {
//     resolve(result.spamTransactions);
//   })
// });

// const showTransactions = () => {
//   loadTransactions().then(displayTransactions);
// };

// showTransactions();

// port.onMessage.addListener(msg => {
//   console.log("message received", msg);
//   if (msg['type']) {
//     switch (msg.type) {
//       case 'TRANSACTION_CREATED':
//         showTransactions();
//         break;
//     }
//   }
// });
