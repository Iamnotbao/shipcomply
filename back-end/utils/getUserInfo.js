const UAParser = require("ua-parser-js");

function getClientIp(directIp) {
  return directIp.replace(/^::ffff:/, "");
}
function getDeviceInfo(result) {
  return {
    browser: `${result.browser.name||'unknown'} ${result.browser.version||'' }`,
    os: `${result.os.name || 'unknown'} ${result.os.version ||''}`,
    device: result.device.type || 'desktop',
    deviceModel: result.device.model || 'unknown',
    deviceVendor: result.device.vendor || 'unknown',
    userAgent: result.userAgent
  };
}

function getClientFullInfo(directIp,result){
    return {
        ip:getClientIp(directIp),
        ...getDeviceInfo(result),
        timestamp : new Date().toISOString()
    }
}
module.exports={getClientIp,getDeviceInfo,getClientFullInfo}