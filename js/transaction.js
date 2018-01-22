function Transaction({iotaObj, curlObj, sendingSeed, receivingAddress}) {
  const DEPTH = 3;
  const MIN_WEIGHT_MAGNITUDE = 14;
  const TAG = 'IOTASPAMTRX';

  const sendTransfer = (reference) => new Promise((resolve, reject) => {
    const transfers = [{ address: receivingAddress, value: 0, tag: TAG }];
    const options = reference ? { reference } : {};

    iotaObj.api.sendTransfer(
      sendingSeed,
      DEPTH,
      MIN_WEIGHT_MAGNITUDE,
      transfers,
      options,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });

  return {
    sendTransfer,
    // getTransactionsToApprove,
    // getInputs,
    // prepareTransfers
  }
};
