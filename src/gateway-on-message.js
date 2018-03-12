export function onmessage(gateway, message) {
  console.log(message);
  if (!message.properties.is_reply) {
    gateway.publisher.data = gateway.generateReplyMessage(message.properties.id, message.properties.source_id);

    switch (message.body.action) {
      case "GW_INIT_RES":
        console.log("GW_INIT_RES", message.body);



        gateway.publisher.data = {
          "properties": gateway.generateMessageProperties(),
          "body": {
            "action": "GW_INIT_RPT",
            "gw_init": {
              "id": gateway.id,
              "version": message.body.gw_version
            }
          }
        };

        gateway.publisher.data = null;

        var indicators = message && message.body && message.body.ind_conf;

        indicators && indicators.forEach(indicator => {
          let component = gateway.findById(indicator.id);

          gateway.publisher.data = {
            "properties": gateway.generateMessageProperties(),
            "body": {
              "action": "IND_INIT_RPT",
              "ind_init": {
                "id": component.id,
                "version": message.body.ind_version
              }
            }
          }

          gateway.publisher.data = null;
        });

        break;
      case "IND_ON_REQ": // 인디케이터 점등
        var indicators = message && message.body && message.body.ind_on;

        indicators && indicators.forEach(indicator => {
          let component = gateway.findById(indicator.id);

          component.setState('org_box_qty', String(indicator.org_box_qty));
          component.setState('org_ea_qty', String(indicator.org_ea_qty));
          component.setState('buttonColor', String(indicator.color));

          var {
            org_box_qty,
            org_ea_qty
          } = component.state;

          gateway.publisher.data = {
            "properties": gateway.generateMessageProperties(),
            "body": {
              "action": "IND_ON_RES",
              "ind_on_res": {
                "id": component.id,
                "order_id": message.body.ind_on.order_id,
                "org_box_qty": org_box_qty,
                "org_ea_qty": org_ea_qty,
                "res_box_qty": 1,
                "res_ea_qty": 1
              }
            }
          }
        });

        break;
      case "GW_DEP_REQ": // 게이트웨이 펌웨어 업데이트
        console.log('GW_DEP_REQ', message.body.gw_url);
        gateway.publisher.data = {
          "properties": gateway.generateMessageProperties(),
          "body": {
            "action": "GW_DEP_RES",
            "dep_res": {
              "id": gateway.id,
              "version": message.body.version,
              "time": Date.now()
            }
          }
        }
        break;
      case "IND_DEP_REQ": // 인디케이터 펌웨어 업데이트
        console.log('IND_DEP_REQ', message.body.ind_url);
        break;
      case "TIMESYNC_RES": // 시간 동기화
        console.log("TIMESYNC_RES", message.body.svr_time);
        // gateway.time = message.body.svr_time;
        break;
    }
  }
}
