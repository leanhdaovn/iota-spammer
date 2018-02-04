function Transaction({iotaObj, curlObj, sendingSeed, receivingAddress}) {
  const DEPTH = 3;
  const MIN_WEIGHT_MAGNITUDE = 14;
  const TAG = '9999ANDYLPROMOTERTX';
  const transfers = [{ address: receivingAddress, value: 0, tag: TAG }];

  const generateStandardCallback = (resolve, reject) => (error, result) => {
    if (error) {
      reject(error)
    } else {
      resolve(result);
    }
  };

  const sendTransfer = (reference) => new Promise((resolve, reject) => {
    const options = reference ? { reference } : {};
    iotaObj.api.sendTransfer(
      sendingSeed, 
      DEPTH, 
      MIN_WEIGHT_MAGNITUDE, 
      transfers, 
      options, 
      generateStandardCallback(resolve, reject)
    );
  });

  return {
    sendTransfer,
    // getTransactionsToApprove,
    // getInputs,
    // prepareTransfers
  }
};
