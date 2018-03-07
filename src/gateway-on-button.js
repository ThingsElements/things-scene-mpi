import start from '../assets/button-start.png';
import stop from '../assets/button-stop.png';
import status from '../assets/button-status.png';
import error from '../assets/button-error.png';

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
}];

function onclickStart(gateway) {
  var {
    indicators,
    publisher
  } = gateway;

  console.log('onclickStart', indicators, publisher);

  if (publisher) {
    publisher.data = {
      body: {
        ind_on: indicators.map(indicator => {
          return {
            id: indicator.get('id'),
            org_box_qty: '000',
            org_ea_qty: '000',
            color: 'black'
          }
        })
      }
    };

    publisher.data = null;
  }
}

function onclickStop(gateway) {
  var {
    indicators,
    publisher
  } = gateway;

  console.log('onclickStop', indicators, publisher);

  if (publisher) {
    publisher.data = {
      body: {
        ind_on: indicators.map(indicator => {
          return {
            id: indicator.get('id'),
            org_box_qty: '000',
            org_ea_qty: '000',
            color: 'black'
          }
        })
      }
    };

    publisher.data = null;
  }
}

function onclickStatus(gateway) {
  console.log('onclickStatus', gateway.indicators);
}

function onclickError(gateway) {
  console.log('onclickError', gateway.indicators);
}
