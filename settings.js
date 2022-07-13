//. IBM App ID
exports.region = 'us-south';
exports.tenantId = '';
exports.apiKey = '';
exports.secret = '';
exports.clientId = '';

exports.redirectUri = 'http://localhost:8080/appid/callback';

exports.oauthServerUrl = 'https://' + exports.region + '.appid.cloud.ibm.com/oauth/v4/' + exports.tenantId;

//. Cloudant
exports.cloudant_url = '';
exports.cloudant_database = 'session_express';
