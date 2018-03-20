export function onMouseDownMButton(indicator) {
  if (indicator.state.boot_flag != "true" || !indicator.lit) return;
  // modify
  console.log('onMouseDownButton', 'M');

  let boxQuan = Math.round(indicator.store.org_box_qty * Math.random());
  let eaQuan = Math.round(indicator.store.org_ea_qty * Math.random());

  indicator.parent.passIndicatorsMessage(makeMsgBody(indicator, "IND_ON_RES", indicator.store, "ok", (indicator.currentTask == indicator.tasks.STOCK) ? (boxQuan * 2) : boxQuan, (indicator.currentTask == indicator.tasks.STOCK) ? (eaQuan * 2) : eaQuan));

  // TODO ack 받으면 소등
  indicator.lightOff();
}

export function onMouseDownFButton(indicator) {
  if (indicator.state.boot_flag != "true" || !indicator.lit || indicator.currentTask == indicator.tasks.STOCK) return;
  // full box
  console.log('onMouseDownButton', 'F');

  indicator.parent.passIndicatorsMessage(makeMsgBody(indicator, "IND_ON_RES", indicator.store, "full"));

  // TODO ack 받으면 소등
  indicator.lightOff();  
}

export function onMouseDownCButton(indicator) {
  if (indicator.state.boot_flag != "true" || !indicator.lit || indicator.currentTask == indicator.tasks.STOCK) return;
  // cancel
  console.log('onMouseDownButton', 'C');

  indicator.parent.passIndicatorsMessage(makeMsgBody(indicator, "IND_ON_RES", indicator.store, "cancel", 0, 0));

  // TODO ack 받으면 소등
  indicator.lightOff();  
}

export function onMouseDownBigButton(indicator) {
  // 작업자 버튼 터치
  if (indicator.state.boot_flag != "true" || !indicator.lit) return;
  console.log('onMouseDownBigButton');

  // 3.6 G/W에 정보 전송
  // 3.7 MPS에 전달
  indicator.parent.passIndicatorsMessage(makeMsgBody(indicator, "IND_ON_RES", indicator.store, "ok" ));  

  // TODO ack 받으면 소등
  indicator.lightOff();
}

var makeMsgBody = function(indicator, action, store, biz, resBox, resEa){
  var {
    org_box_qty,
    org_ea_qty
  } = indicator.state;
  
  return {
    "action": action,
    "id": indicator.model.id,
    "biz_id": store ? store.biz_id : undefined,
    "biz_type": store.biz_type,
    "action_type": store.action_type,
    "biz_flag": biz,
    "org_box_qty": store ? parseInt(store.org_box_qty) : 0 || 0,
    "org_ea_qty": store ? parseInt(store.org_ea_qty) : 0 || 0,
    "res_box_qty": resBox || parseInt(org_box_qty),
    "res_ea_qty": resEa || parseInt(org_ea_qty)
  }
}

// var currentAction = function(indicator){
//   var resActStr = "";
  
//   switch (indicator.currentTask) {
//     case indicator.tasks.PICK:
//       resActStr = "IND_ON_RES";
//       break;
//     case indicator.tasks.STOCK:
//       resActStr = "STOCK_ON_RES";
//       break;
//     default :
//       resActStr = null;
//   };

//   return resActStr;
// }