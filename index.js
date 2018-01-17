var iota = new IOTA({ 'provider': 'http://01.iota-node.tilthat.com:14265'});

curl.init();
curl.overrideAttachToTangle(iota);

var spammer = new Spammer({ iotaObj: iota, curlObj: curl});

spammer.init().then(spammer.start);
