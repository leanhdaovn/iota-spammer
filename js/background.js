const KEEP_TX_QUANTITY = 10;

const providers = [
  'http://178.238.237.200:14265',
  'http://iotanode.party:14265',
  'http://iota.pathin.net:14265',
  'http://heimelaga.vodka:14265',
  'https://nodes.thetangle.org:443',
  'http://iotamn-sea3.bourg.net:14267',
  'https://node.iotanode.host:443',
  'http://iota.moz.cloud:14265',
  'http://apache.hopto.me:14265',
  'https://tuna.iotasalad.org:14265',
  'http://45.77.232.81:14265',
  'http://188.166.225.112:14265',
  'http://213.136.88.82:14265',
  'https://node.iotanode.host:443',
  'http://node.davidsiota.com:14265',
  'http://node.lukaseder.de:14265'
];

const blackListedProviders = [];

const getRandomItem = (array) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

const getRandomProvider = () => new Promise((resolve, reject) => {
  const getHealthyProvider = () => {
    const provider = getRandomItem(providers);
    const iota = new IOTA({ provider });
    try {
      iota.api.getNodeInfo((e, s) => { 
        if (e) throw e;
        else resolve(provider);
      });
    } catch(error) {
      getHealthyProvider();
    }
  };

  getHealthyProvider();
});

const transactions = [];
var totalTx = 0;
let promoter;

getRandomProvider()
  .then(provider => new IOTA({ provider: provider }))
  .then(iotaObj => {
    curl.init();
    curl.overrideAttachToTangle(iotaObj);
    promoter = new Promoter({ iotaObj: iotaObj, curlObj: curl });    
  });


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
  chrome.storage.local.get({ spamming: false }, function ({spamming}) {
    if (!spamming) {
      chrome.storage.local.set({ spamming: true })
      console.log("Start spamming");
      const portState = { connected: true };

      port.onDisconnect.addListener((e) => {
        console.log("disconnected...");
        portState.connected = false;
      });

      while (!promoter) {}

      const switchProvider = () => new Promise((resolve, reject) => {
        getRandomProvider().then(newProvider => {
          const iota = promoter.iota;
          console.log(`Switching provider from ${iota.provider} to ${newProvider}`);
          iota.changeNode({ provider: newProvider });
          curl.overrideAttachToTangle(iota);
          resolve();
        });
      });

      promoter.onTransactionCreated = txHash => new Promise((resolve, reject) => {
        createSendTxHash(port, portState)(txHash);
        switchProvider().then(resolve);
      });

      promoter.onTransactionFailure = () => new Promise((resolve, reject) => {
        switchProvider().then(resolve);
      });
      
      promoter.start();
    }
  });
};

const stopSpam = promoter => {
  console.log("Stop spamming");
  promoter.stop();
  chrome.storage.local.set({ spamming: false });
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