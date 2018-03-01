const KEEP_TX_QUANTITY = 10;
const providers = ['http://iota-nodes.tilthat.com'];
const blackListedProviders = [];
const transactions = [];
let totalTx = 0;
let promoter;

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
};

const startPromoting = (promoter, port, txHash) => {
  chrome.storage.local.get({ promoting: false }, function ({ promoting }) {
    if (true /*!promoting*/) {
      chrome.storage.local.set({ promoting: true })
      console.log("Start promoting");
      const portState = { connected: true };

      port.onDisconnect.addListener((e) => {
        console.log("disconnected...");
        portState.connected = false;
      });

      // wait for promoter to be initialized
      while (!promoter) { }

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
        // switchProvider().then(resolve);
        stopPromoting(promoter);
        resolve();
      });

      promoter.onTransactionConfirmed = () => new Promise((resolve, reject) => {
        stopPromoting(promoter);
      });

      promoter.start(txHash);
    }
  });
};

const stopPromoting = promoter => {
  console.log("Stop promoting");
  promoter.stop();
  chrome.storage.local.set({ promoting: false });
};

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
        case 'START_PROMOTING':
          startPromoting(promoter, port, msg.payload.transactionHash);
          break;
        case 'STOP_PROMOTING':
          stopPromoting(promoter);
          break;
      }
    }
  });
});