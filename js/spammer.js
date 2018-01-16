function Spammer({iotaObj, curlObj}) {
  const TRYTE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ9";

  const generateSeed = () => {
    return Array(81).join().split(',')
      .map(() => TRYTE_ALPHABET.charAt(Math.floor(Math.random() * TRYTE_ALPHABET.length))).join('');
  }

  const sendingSeed = generateSeed();
  const receivingSeed = generateSeed();

  console.log({ sendingSeed, receivingSeed });

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

  return {
    initialize: () => new Promise((resolve, reject) => {
      Promise.all([getNewAddress(sendingSeed), getNewAddress(receivingSeed)]).then((addresses) => {
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

    singleSpam: () => {
      const transaction = new Transaction({ iotaObj, curlObj, sendingSeed, receivingAddress });
      transaction.sendTransfer();
    },

    start: () => {},

    stop: () => {},

    setFrequency: (frequency) => {}
  }
};