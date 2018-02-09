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

const displayTransactions = (transactions) => {
  var txListEle = document.getElementById('tx-list');
  var txListRows = transactions.map(tx => {
    const time = new Date(tx.timestamp);
    return `
    <li>
      <span>${time.toLocaleString()} </span>
      <a href="https://thetangle.org/transaction/${tx.hash}">${tx.hash.substr(0, 6)}</a>
    </li>
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
