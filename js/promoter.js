const DELAY_PERIOD = 60; // seconds

function Promoter({iotaObj, curlObj}) {
  const TRYTE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ9";

  const generateSeed = () => {
    return Array(81).join().split(',')
      .map(() => TRYTE_ALPHABET.charAt(Math.floor(Math.random() * TRYTE_ALPHABET.length))).join('');
  }

  const sendingSeed = generateSeed();
  const receivingSeed = generateSeed();
  var sendingAddress, receivingAddress, inputs, trytes;
  var promoting = false;
  var promotionCount = 0;

  const generateStandardCallback = (resolve, reject) => (error, result) => {
    if (error) {
      reject(error)
    } else {
      resolve(result);
    }
  };

  // const displayTransactions = () => {
  //   var hashes = transactions.map(tx => tx.hash);
  //   iota.api.getLatestInclusion(hashes, (error, results) => {
  //     var txListEle = document.getElementById('tx-list');
  //     var txListItems = hashes.map((hash, index) => {
  //       return `<tr><td>${results[index]}</td><td><a href="https://thetangle.org/transaction/${hash}">${hash}</a></td></tr>`;
  //     });
  //     txListEle.innerHTML = txListItems.join('');
  //   });
  // }

  const getNewAddress = (seed) => new Promise((resolve, reject) => {
    iotaObj.api.getNewAddress(seed, generateStandardCallback(resolve, reject));
  });

  const getTransactionToPromote = () => new Promise((resolve, reject) => {
    // var request = new Request('https://api.thetangle.org/v1/transactions/history/5');
    // fetch(request)
    //   .then(response => response.json())
    //   .then(responseObj => {
    //     const hashToPromote = responseObj.positiveTransactions[0].hash;
    //     console.log(`Trx to promote: ${hashToPromote}`);
    //     resolve(hashToPromote);
    //   });
    resolve();
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

  const singlePromote = (referenceHash) => new Promise((resolve, reject) => {
    const transaction = new Transaction({ iotaObj, curlObj, sendingSeed, receivingAddress });
    transaction.sendTransfer(referenceHash).then(tx => {
      const txHash = tx[0].hash;
      transactions.push(tx[0]);
      console.log(`Finished ${transactions.length} transactions.` );
      console.log(txHash);
      resolve(txHash);
    });
  });

  return {
    init: () => new Promise((resolve, reject) => {
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
    }),

    start: () => {
      var txHashToPromote;
      const promote = () => {
        if (!promoting) return;

        const makeSinglePromote = () => {
          singlePromote(txHashToPromote).then(txHash => {
            txHashToPromote = txHashToPromote || txHash;
            checkReference(txHashToPromote)
              .then(({ promotable }) => {
                if (!promotable) {
                  txHashToPromote = null;
                }
              })
              .then(() => {
                console.log(`Resting for ${DELAY_PERIOD} seconds`);
                setTimeout(promote, DELAY_PERIOD * 1000);
              });
          });
        };

        if (!txHashToPromote) {
          getTransactionToPromote()
            .then(hash => { txHashToPromote = hash; })
            .then(makeSinglePromote);
        } else {
          makeSinglePromote();
        }

      };
      promoting = true;
      promote();
    },

    stop: () => { promoting = false; },

    setFrequency: (frequency) => {}
  }
};