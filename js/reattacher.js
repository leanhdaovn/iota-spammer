function Reattacher({ iotaObj }) {
  this.depth = 3;
  this.minWeightMagnitude = 14;
  this.iota = iotaObj;
};

Reattacher.prototype.reattach = function(txnHash) {
  this.iota.api.replayBundle(
    txnHash,
    this.depth,
    this.minWeightMagnitude,
    (error, result) => {
      if (error) {
        this.onReattachFailure(error);
      } else {
        this.onReattachSuccess(result);
      }
    }
  )
};

Reattacher.prototype.onReattachSuccess = function(txHash) { };
Reattacher.prototype.onReattachFailure = function() { };
