import {
  consoleLogger
} from './gateway-on-message';

export function onMouseDownMButton(indicator) {
  if (indicator.state.boot_flag != "true" || !indicator.lit || indicator.readOnly || indicator.currentTask === indicator.tasks.FULL || indicator.currentTask === indicator.tasks.END) return;
  // modify
  consoleLogger('onMouseDownButton', 'M');

  var boxQuan = indicator.store.org_box_qty ? indicator.store.org_box_qty : false;
  var eaQuan = indicator.store.org_ea_qty ? indicator.store.org_ea_qty : false;
  var isSame = true;
  var userAction = 'modify';
  
  // switch(indicator.currentTask) {
  //   case indicator.tasks.PICK: {
  //     var isQtyLessThenOne = (!indicator.store.org_box_qty && (indicator.store.org_ea_qty <= 1 || !indicator.store.org_ea_qty));
      
  //     if (isQtyLessThenOne) {
  //       userAction = 'ok';
  //     } else {
  //       do {
  //         if(boxQuan) boxQuan = Math.round(boxQuan * Math.random());
  //         if(eaQuan) eaQuan = Math.round(eaQuan * Math.random());

  //         isSame = (indicator.store.org_box_qty == boxQuan) && (indicator.store.org_ea_qty == eaQuan);
  //       } while(isSame);
  //     }
  //   } break;
  //   case indicator.tasks.STOCK: {
  //     if (boxQuan) boxQuan = Math.ceil(boxQuan * Math.random());
  //     if (eaQuan) eaQuan = Math.ceil(eaQuan * Math.random());
  //   } break;
  // }

  boxQuan = Math.ceil(boxQuan / 2);
  eaQuan = Math.ceil(eaQuan / 2);

  isSame = (boxQuan == indicator.store.org_box_qty) && (eaQuan == indicator.store.org_ea_qty);

  isSame ? userAction = 'ok' : userAction = 'modify';

  indicator.gateway.passIndicatorsMessage(_makeMsgBody(indicator, "IND_ON_RES", indicator.store, userAction, boxQuan, eaQuan));

  // TODO ack 받으면 소등
  indicator.lightOff();
}

export function onMouseDownFButton(indicator) {
  if (indicator.state.boot_flag != "true" || !indicator.lit || indicator.readOnly || indicator.currentTask == indicator.tasks.STOCK || indicator.currentTask === indicator.tasks.FULL) return;
  // full box
  consoleLogger('onMouseDownButton', 'F');

  indicator.gateway.passIndicatorsMessage(_makeMsgBody(indicator, "IND_ON_RES", indicator.store, "full"));

  // TODO ack 받으면 소등
  indicator.lightOff();
}

export function onMouseDownCButton(indicator) {
  if (indicator.state.boot_flag != "true" || !indicator.lit || indicator.readOnly || indicator.currentTask == indicator.tasks.STOCK || indicator.currentTask === indicator.tasks.FULL || indicator.currentTask === indicator.tasks.END) return;
  // cancel
  consoleLogger('onMouseDownButton', 'C');
  indicator.displayMessage('CAnCEL');

  // 일정 시간 후 소등
  setTimeout(() => {
    indicator.gateway.passIndicatorsMessage(_makeMsgBody(indicator, "IND_ON_RES", indicator.store, "cancel", 0, 0));
    indicator.lightOff();
  }, indicator.getConf.cncl_delay * 100);
}

export function onMouseDownBigButton(indicator) {
  // 작업자 버튼 터치
  if (indicator.state.boot_flag != "true" || !indicator.lit || indicator.readOnly || indicator.currentTask === indicator.tasks.END) return;
  consoleLogger('onMouseDownBigButton');

  // 3.6 G/W에 정보 전송
  // 3.7 MPS에 전달
  indicator.gateway.passIndicatorsMessage(_makeMsgBody(indicator, "IND_ON_RES", indicator.store, "ok"));

  // TODO ack 받으면 소등
  indicator.lightOff();
}

var _makeMsgBody = function (indicator, action, store, biz, resBox, resEa) {
  var {
    org_box_qty,
    org_ea_qty
  } = indicator.state;

  var result;
  result = {
    action: action,
    id: indicator.model.id,
    biz_id: store ? store.biz_id : undefined,
    biz_type: store.biz_type,
    action_type: store.action_type,
    ret_args: store.ret_args,
    biz_flag: biz
  };
  if(store){
    if (store.org_relay || store.org_relay == 0) {
      result.org_relay = parseInt(store.org_relay);
    }
    if (store.org_box_qty || store.org_box_qty == 0) {
      result.org_box_qty = parseInt(store.org_box_qty);
      result.res_box_qty = resBox >= 0? resBox : parseInt(store.org_box_qty);
    }
    if (store.org_ea_qty || store.org_ea_qty == 0) {
      result.org_ea_qty = parseInt(store.org_ea_qty);
      result.res_ea_qty = resEa >= 0? resEa : parseInt(store.org_ea_qty);
    }
  }
  return result;
}