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

const displayTransactions = (transactions) => {
  const sortedTxs = transactions.sort((tx1, tx2) => (tx2.timestamp - tx1.timestamp));

  const txListEle = document.getElementById('tx-list');
  const txListRows = sortedTxs.map(tx => {
    const time = new Date(tx.timestamp);
    return `
    <tr>
      <td class="mdl-data-table__cell--non-numeric">${time.toLocaleString()}</td>
      <td class="mdl-data-table__cell--non-numeric"><a href="https://thetangle.org/transaction/${tx.hash}">${tx.hash.substr(0, 20)}...</a></td>
    </tr>
    `;
  });
  txListEle.innerHTML = txListRows.join('');
};

const loadTransactions = () => new Promise((resolve, reject) => {
  chrome.storage.local.get({spamTransactions: []}, function (result) {
    resolve(result.spamTransactions);
  })
});

const showTransactions = () => {
  loadTransactions().then(displayTransactions);
};

showTransactions();

port.onMessage.addListener(msg => {
  console.log("message received", msg);
  if (msg['type']) {
    switch (msg.type) {
      case 'TRANSACTION_CREATED':
        showTransactions();
        break;
    }
  }
});
