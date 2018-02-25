function Transaction({iotaObj, curlObj, sendingSeed}) {
  const DEPTH = 3;
  const MIN_WEIGHT_MAGNITUDE = 14;
  const RAW_MESSAGE = 'IOTA utilities extension https://chrome.google.com/webstore/detail/iota-utilities/ipnmkjhnbmheomjegeaifflgbmjgpfja ';
  const transfers = [{ 
    address: 'IOTA9UTILITIES9999999999999999999999999999999999999999999999999999999999999999999', 
    value: 0, 
    tag: '9999999999999IOTA9UTILITIES',
    message: iotaObj.utils.toTrytes(RAW_MESSAGE)
  }];

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
