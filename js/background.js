const KEEP_TX_QUANTITY = 10;

const providers = [
  'http://178.238.237.200:14265',
  // 'http://iotanode.party:14265',
  // 'http://iota.pathin.net:14265',
  // 'http://heimelaga.vodka:14265',
  // 'https://nodes.thetangle.org:443',
  // 'http://iotamn-sea3.bourg.net:14267',
  // 'https://node.iotanode.host:443',
  // 'http://iota.moz.cloud:14265',
  // 'http://apache.hopto.me:14265',
  // 'https://tuna.iotasalad.org:14265',
  // 'http://45.77.232.81:14265',
  // 'http://188.166.225.112:14265'
];

const transactions = [];
var totalTx = 0;
curl.init();

const iotaObj = new IOTA({ 'provider': providers[0] });
curl.overrideAttachToTangle(iotaObj);
const promoter = new Promoter({ iotaObj: iotaObj, curlObj: curl });

const storeTx = txHash => new Promise((resolve, reject) => {
  const now = Date.now();
  chrome.storage.local.get({spamTransactions: []}, function (result) {
    const transactions = result.spamTransactions;
    while (transactions.length > (KEEP_TX_QUANTITY - 1)) { transactions.shift(); }

    transactions.push({ hash: txHash, timestamp: now });
    chrome.storage.local.set({ spamTransactions: transactions }, resolve);
  });
});

const createSendTxHash = (port, portState) => {
  return txHash => {
    storeTx(txHash).then(() => {
      if (!portState.connected) return;
      port.postMessage({ type: 'TRANSACTION_CREATED' });
    })
  };
};

const startSpam = (promoter, port) => {
  chrome.storage.local.get({ spamming: false }, function (spamming) {
    if (!spamming) {
      chrome.storage.local.set({ spamming: true })
      console.log("Start spamming");
      const portState = { connected: true };

      port.onDisconnect.addListener((e) => {
        console.log("disconnected...");
        portState.connected = false;
      });

      promoter.onTransactionCreated = createSendTxHash(port, portState);
      promoter.start();
    }
  });
};

const stopSpam = promoter => {
  console.log("Stop spamming");
  promoter.stop();
}

chrome.extension.onConnect.addListener(port => {
  console.log("Connected .....");
  port.onMessage.addListener(function (msg) {
    console.log("message received", msg);
    if (msg['type']) {
      switch (msg.type) {
        case 'START_SPAM':
          startSpam(promoter, port);
          break;
        case 'STOP_SPAM':
          stopSpam(promoter);
          break;
      }
    }
  });
});