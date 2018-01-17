function Transaction({iotaObj, curlObj, sendingSeed, receivingAddress}) {
  const DEPTH = 4;
  const MIN_WEIGHT_MAGNITUDE = 14;
  const TAG = 'SBYBCCKBBCZBKBWBCCACGC99999'; // 'IOTASPAMTRX'

  // const getTransactionsToApprove = () => new Promise((resolve, reject) => {
  //   iotaObj.api.getTransactionsToApprove(4, null, (error, toApprove) => {
  //     if (error) {
  //       reject(error);
  //     } else {
  //       resolve(toApprove);
  //     }
  //   })
  // });

  // const getInputs = () => new Promise((resolve, reject) => {
  //   iotaObj.api.getInputs(sendingSeed, (error, result) => {
  //     if (error) {
  //       reject(error);
  //     } else {
  //       resolve(result.inputs);
  //     }
  //   });
  // });

  // const prepareTransfers = (inputs) => new Promise((resolve, reject) => {
  //   iotaObj.api.prepareTransfers(
  //     sendingSeed,
  //     [{ address: receivingAddress, value: 0 }],
  //     { inputs },
  //     (error, result) => {
  //       if (error) {
  //         reject(error);
  //       } else {
  //         resolve(result);
  //       }
  //     }
  //   );
  // });

  const sendTransfer = () => new Promise((resolve, reject) => {
    const transfers = [{ address: receivingAddress, value: 0, tag: TAG }];
    iotaObj.api.sendTransfer(
      sendingSeed, 
      DEPTH, 
      MIN_WEIGHT_MAGNITUDE, 
      transfers, 
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          console.log({ transactions: result });
          resolve(result);
        }
      }
    )
  });

  return {
    sendTransfer,
    // getTransactionsToApprove,
    // getInputs,
    // prepareTransfers
  }
};
