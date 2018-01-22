function Spammer({iotaObj, curlObj}) {
  const TRYTE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ9";

  const generateSeed = () => {
    return Array(81).join().split(',')
      .map(() => TRYTE_ALPHABET.charAt(Math.floor(Math.random() * TRYTE_ALPHABET.length))).join('');
  }

  const sendingSeed = generateSeed();
  const receivingSeed = generateSeed();

  const displayTransactions = () => {
    var trxListEle = document.getElementById('trx-list');
    var trxListItems = transactions.map(trx => {
      return `<li><a href="https://thetangle.org/transaction/${trx.hash}">${trx.hash}</a></li>`;
    });
    trxListEle.innerHTML = trxListItems.join('');
  }

  // console.log({ sendingSeed, receivingSeed });

  var sendingAddress, receivingAddress, inputs, trytes;

  const getNewAddress = (seed) => new Promise((resolve, reject) => {
    iotaObj.api.getNewAddress(seed, (error, address) => {
      if (error) {
        reject(error)
      } else {
        resolve(address);
      }
    });
  })

  var spamming = false;
  var spamCount = 0;

  const init = () => new Promise((resolve, reject) => {
    Promise.all([getNewAddress(sendingSeed), getNewAddress(receivingSeed)]).then(addresses => {
      sengindAddress = addresses[0];
      receivingAddress = addresses[1];
      resolve({
        sendingSeed,
        receivingSeed,
        sendingAddress,
        receivingAddress
      })
    })
  });

  const checkReference = transactionHash => new Promise((resolve, reject) => {
    if (!transactionHash) {
      resolve({ confirmed: true });
    } else {
      iotaObj.api.isPromotable(transactionHash).then(promotable => {
        if(!promotable) {
          console.log(`%cUnpromotable transaction ${transactionHash}`, "background: grey; font-size: x-large");
          resolve({ promotable: false });
        } else {
          iotaObj.api.getLatestInclusion([transactionHash], (error, result) => {
            if (error) {
              reject(error);
            } else {
              const confirmed = result[0];
              if (confirmed) {
                console.log(`%cTransaction confirmed: ${transactionHash}`, "background: yellow; font-size: x-large");
              }
              resolve({ promotable: !confirmed });
            }
          });
        }
      });
    }
  });

  const singleSpam = (referenceHash) => new Promise((resolve, reject) => {
    const transaction = new Transaction({ iotaObj, curlObj, sendingSeed, receivingAddress });
    transaction.sendTransfer(referenceHash).then(trx => {
      const trxHash = trx[0].hash;
      transactions.push(trx[0]);
      console.log(`Finished ${transactions.length} transactions.` );
      resolve(trxHash);
    });
  });

  const start = () => {
    var referenceHash;
    const spam = () => {
      if (!spamming) return;
      // spamCount++;
      totalTrx++;
      // console.log('Start spam #' + spamCount);
      singleSpam(referenceHash).then((trxHash) => {
        // console.log('Completed spam #' + spamCount);
        // console.log('Completed total ' + totalTrx + ' spams #');
        displayTransactions();
        referenceHash = referenceHash || trxHash;
        checkReference(referenceHash).then(({ promotable }) => {
          if (!promotable) {
            referenceHash = null;
          }
          spam();
        });
      });
    };
    spamming = true;
    spam();
  };

  const stop = () => {
    spamming = false;
  };

  return {
    init,
    singleSpam,
    start,
    stop,
    setFrequency: (frequency) => {}
  }
};