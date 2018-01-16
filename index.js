var iotaObj = new IOTA({'provider': 'http://02.iota-node.tilthat.com:14265'});
var spammer = new Spammer({iotaObj, curlObj: curl});
spammer.initialize();
