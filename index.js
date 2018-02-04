const providers = [
  'http://178.238.237.200:14265',
  // 'http://iotanode.party:14265',
  // 'http://iota.pathin.net:14265',
  // 'http://heimelaga.vodka:14265',
  // 'https://nodes.thetangle.org:443',
  // 'http://iotamn-sea3.bourg.net:14267',
  // 'https://node.iotanode.host:443',
  // 'http://iota.moz.cloud:14265',
  // 'http://apache.hopto.me:14265',
  // 'https://tuna.iotasalad.org:14265',
  // 'http://45.77.232.81:14265',
  // 'http://188.166.225.112:14265'
];

const transactions = [];
var totalTx = 0;
curl.init();

const promoters = providers.map(provider => {
  var iotaObj = new IOTA({ 'provider': provider });
  curl.overrideAttachToTangle(iotaObj);
  var promoter = new Promoter({ iotaObj: iotaObj, curlObj: curl });
  promoter.init().then(promoter.start);
  return promoter;
});

const iota = new IOTA({ 'provider': providers[0] });