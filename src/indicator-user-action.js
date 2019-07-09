import { consoleLogger } from "./gateway-on-message";

export function onMouseDownMButton(indicator) {
  if (
    indicator.state.boot_flag != "true" ||
    !indicator.lit ||
    indicator.readOnly ||
    indicator.currentTask === indicator.tasks.FULL ||
    indicator.currentTask === indicator.tasks.END ||
    indicator.currentTask === indicator.tasks.INSPECT
  )
    return;
  // modify
  consoleLogger("onMouseDownButton", "M");

  var boxQuan = indicator.store.org_box_qty
    ? indicator.store.org_box_qty
    : false;
  var eaQuan = indicator.store.org_ea_qty ? indicator.store.org_ea_qty : false;
  var isSame = true;
  var userAction = "modify";

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

  isSame =
    boxQuan == indicator.store.org_box_qty &&
    eaQuan == indicator.store.org_ea_qty;

  isSame ? (userAction = "ok") : (userAction = "modify");

  indicator.gateway.passIndicatorsMessage(
    _makeMsgBody(
      indicator,
      "IND_ON_RES",
      indicator.store,
      userAction,
      boxQuan,
      eaQuan
    )
  );

  // TODO 프로토콜 변경
  var displayData = {};
  displayData.org_ea_qty = indicator.store.org_ea_qty; //왼쪽 세그먼트 표시 안 함
  displayData.buttonColor = indicator.colors["K"];
  indicator.cookedData = displayData;
  indicator.jobLightOn(displayData);
}

export function onMouseDownFButton(indicator) {
  if (
    indicator.state.boot_flag != "true" ||
    !indicator.lit ||
    indicator.readOnly ||
    indicator.currentTask == indicator.tasks.STOCK ||
    indicator.currentTask === indicator.tasks.FULL
  )
    return;
  // full box
  consoleLogger("onMouseDownButton", "F");

  indicator.gateway.passIndicatorsMessage(
    _makeMsgBody(indicator, "IND_ON_RES", indicator.store, "full")
  );

  // TODO ack 받으면 소등
  // TODO 프로토콜 변경
  indicator.displayMessage("-FULL-", indicator.store.color);
  indicator.currentTask = indicator.tasks.FULL;
}

export function onMouseDownCButton(indicator) {
  if (
    indicator.state.boot_flag != "true" ||
    !indicator.lit ||
    indicator.readOnly ||
    indicator.currentTask == indicator.tasks.STOCK ||
    indicator.currentTask === indicator.tasks.FULL ||
    indicator.currentTask === indicator.tasks.END
  )
    return;
  // cancel
  consoleLogger("onMouseDownButton", "C");
  indicator.displayMessage("CAnCEL");

  // 일정 시간 후 소등
  setTimeout(() => {
    indicator.gateway.passIndicatorsMessage(
      _makeMsgBody(indicator, "IND_ON_RES", indicator.store, "cancel", 0, 0)
    );
    indicator.lightOff();
  }, indicator.getConf.cncl_delay * 100);
}

export function onMouseDownBigButton(indicator) {
  // 작업자 버튼 터치
  if (
    indicator.state.boot_flag != "true" ||
    !indicator.lit ||
    indicator.readOnly ||
    indicator.currentTask === indicator.tasks.END
  )
    return;
  consoleLogger("onMouseDownBigButton");
  if (indicator.currentTask === indicator.tasks.FULL) {
    indicator.jobLightOn(indicator.cookedData);
    indicator.currentTask = indicator.tasks.DISPLAY;
    return;
  } else if (indicator.currentTask === indicator.tasks.INSPECT) {
    indicator.lightOff();
    return;
  }

  // 3.6 G/W에 정보 전송
  // 3.7 MPS에 전달
  indicator.gateway.passIndicatorsMessage(
    _makeMsgBody(indicator, "IND_ON_RES", indicator.store, "ok")
  );

  // TODO ack 받으면 소등

  // 확정 누르면 오른쪽 세그먼트 숫자만 남기고 소등, display 시퀀스를 생략하기 위함
  // TODO 프로토콜 변경
  var displayData = {};
  displayData.org_ea_qty = indicator.store.org_ea_qty; //왼쪽 세그먼트 표시 안 함
  displayData.buttonColor = indicator.colors["K"];
  indicator.cookedData = displayData;
  indicator.jobLightOn(displayData);
}

var _makeMsgBody = function(indicator, action, store, biz, resBox, resEa) {
  var { org_box_qty, org_ea_qty } = indicator.state;

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
  if (store) {
    if (store.org_relay || store.org_relay == 0) {
      result.org_relay = parseInt(store.org_relay);
    }
    if (store.org_box_qty || store.org_box_qty == 0) {
      result.org_box_qty = parseInt(store.org_box_qty);
      result.res_box_qty = resBox >= 0 ? resBox : parseInt(store.org_box_qty);
    }
    if (store.org_ea_qty || store.org_ea_qty == 0) {
      result.org_ea_qty = parseInt(store.org_ea_qty);
      result.res_ea_qty = resEa >= 0 ? resEa : parseInt(store.org_ea_qty);
    }
  }
  return result;
};
