import start from '../assets/button-start.png';
import stop from '../assets/button-stop.png';
import status from '../assets/button-status.png';
import error from '../assets/button-error.png';

import { consoleLogger } from './gateway-on-message';

export const buttons = [{
  icon: start,
  handler: onclickStart
}, {
  icon: stop,
  handler: onclickStop
}, {
  icon: status,
  handler: onclickStatus
}, {
  icon: error,
  handler: onclickError
}, {
  icon: status,
  handler: onclickTimesync
}];

function onclickStart(gateway) {
  // Boot
  // 전원 ON
  consoleLogger('onclickStart');
  gateway.boot();
}

function onclickStop(gateway) {
  // 전원 OFF
  consoleLogger('onclickStop');
  gateway.off();
}

function onclickStatus(gateway) {
  consoleLogger('onclickStatus');
  if (gateway.state.power_flag == "false") return;

  ////////random indicator////////
  var indicator = gateway.indicators[Math.floor(Math.random() * gateway.indicators.length)];

  gateway.publisher.data = {
    properties: gateway.generateMessageProperties(),
    body: {
      action: "IND_STATUS_RPT",
      id: indicator.model.id,
      version: indicator.version,
      status: (Math.random() > 0.5) ? "ok" : "offline" // random status
      // status: (indicator.state.boot_flag == "true") ? "ok" : "offline"
    }
  }
  consoleLogger("sent IND_STATUS_RPT", gateway.publisher.data);
  ////////////////////////////////
}

function onclickError(gateway) {
  consoleLogger('onclickError');
  if (gateway.state.power_flag == "false") return;

  let hwgb = Math.random();

  gateway.publisher.data = {
    properties: gateway.generateMessageProperties(),
    body: {
      action: "ERR_RPT",
      hw_gb: (hwgb > 0.5) ? "gw" : "ind",
      id: (hwgb > 0.5) ? gateway.model.id : gateway.indicators[Math.floor(hwgb * gateway.indicators.length * 2)].model.id,
      message: ["ERR001", "ERR002", "ERR003", "ERR004", "ERR005", "ERR006"][Math.floor(Math.random() * 6)]
    }
  }
  consoleLogger("sent ERR_RPT", gateway.publisher.data);
}

function onclickTimesync(gateway) {
  consoleLogger('onclickTimesync');
  if (gateway.state.power_flag == "false") return;

  gateway.publisher.data = {
    properties: gateway.generateMessageProperties(),
    body: {
      action: "TIMESYNC_REQ"
    }
  }
  consoleLogger("sent TIMESYNC_REQ", gateway.publisher.data);
}
