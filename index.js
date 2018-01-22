const providers = [
  'http://178.238.237.200:14265'
];

const transactions = [];
var totalTrx = 0;
curl.init();

const spammers = providers.map(provider => {
  var iota = new IOTA({ 'provider': provider });
  curl.overrideAttachToTangle(iota);
  var spammer = new Spammer({ iotaObj: iota, curlObj: curl });
  spammer.init().then(spammer.start);
  return spammer;
});
