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
    transactions.push({ hash: txHash, timestamp: now });
    chrome.storage.local.set({ spamTransactions: transactions }, resolve);
  });
});

const createSendTxHash = port => {
  var connected = true;

  port.onDisconnect = () => { connected = false; };

  return txHash => {
    storeTx(txHash).then(() => {
      if (!connected) return;
      port.postMessage({ type: 'TRANSACTION_CREATED' });
    })
  };
};

const startSpam = (promoter, port) => {
  console.log("Start spamming");
  promoter.onTransactionCreated = createSendTxHash(port);
  promoter.start();
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