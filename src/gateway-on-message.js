export function onmessage(gateway, message) {
  if (gateway.state.power_flag == "false") return;
  if (!message.properties.is_reply) {
    console.log("received " + (message.body.action ? message.body.action : "unknown action"), message);

    // 메시지 reply에 action string 추가, stock 또는 ind on 명령일 경우 biz id 추가
    gateway.publisher.data =
      gateway.generateReplyMessage(message.properties.id, message.properties.source_id, message.body.action, message.body);
    console.log("sent reply: ", gateway.publisher.data);

    switch (message.body.action) {
      // 2.5 boot response
      case "GW_INIT_RES":
        if (gateway.state.boot_flag == "true") return;

        // 2.6 gateway initialize
        if (!gateway.version) gateway.version = message.body.gw_version;

        gateway.setTimer(message.body.svr_time);
        gateway.timerOn();

        gateway.publisher.data = {
          "properties": gateway.generateMessageProperties(),
          "body": {
            "action": "GW_INIT_RPT",
            "id": gateway.model.id,
            "version": gateway.version,
            // "dummy": "dummy"
          }
        };
        console.log("sent GW_INIT_RPT", gateway.publisher.data);

        gateway.setState('boot_flag', String("true")); // gw on        

        // 2.7 indicator 초기화 요청
        let indConf = message && message.body && message.body.ind_conf;

        // ?? indicator 초기화 모두 완료 ??
        let i = 0;
        gateway.indicators.forEach(indicator => {
          // 2.8 indicator 초기화
          // let component = gateway.findById(indicator.id);
          let component = indicator;
          if (!component) return;

          component.setState('boot_flag', String("true"));
          
          if(!component.model.id){
            component.model.id = indConf[i].id;
            gateway.root.indexMap[component.model.id] = component;
            i++;
          }

          if (!component.version) component.version = message.body.ind_version;

          switch (indicator.led_type) {
            case component.ledTypes.BLINK:
              component.setState('led_type', String(component.ledTypes.BLINK));
              break;
            case component.ledTypes.ALWAYS:
            default:
              component.setState('led_type', String(component.ledTypes.ALWAYS));
              break;
          }

          // 2.9 indicator 준비 완료
          gateway.publisher.data = {
            "properties": gateway.generateMessageProperties(),
            "body": {
              "action": "IND_INIT_RPT",
              "id": component.model.id,
              "version": component.version
            }
          }
          console.log("sent IND_INIT_RPT", gateway.publisher.data);

          // 2.10 indicator ID 소등
          component.lightOff();
        });
        // indicator 초기화 모두 완료

        break;
      // case "STOCK_ON_REQ":
      //   if (gateway.state.boot_flag == "false") return;
      //   gateway.indicators.forEach(indicator => {
      //     indicator.lightOff();
      //   });

      //   var indicators = message && message.body && message.body.stock_on;

      //   indicators && indicators.forEach(indicator => {
      //     let component = gateway.findById(indicator.id);
      //     if (!component) return;
      //     if (component.state.boot_flag == "false") return;
      //     component.store = indicator;
      //     component.currentTask = component.tasks.STOCK;

      //     component.setState('org_box_qty', String(("00" + indicator.org_box_qty).substr(-3)));
      //     component.setState('org_ea_qty', String(("00" + indicator.org_ea_qty).substr(-3)));
      //     component.setState('buttonColor', String(component.colors[indicator.color] || "black"));

      //     component.lit = true; // 인디케이터 점등여부 확인용 | 소등시 버튼 반응 없도록
      //   });
      //   break;
      // 3.3 G/W에 indicator 점등 요청
      case "IND_ON_REQ":
        if (gateway.state.boot_flag == "false") return;

        // 3.4 indicator에 점등 요청
        // 전체 소등
        gateway.indicators.forEach(indicator => {
          indicator.lightOff();
        });

        let indOn = message && message.body && message.body.ind_on;

        // 3.5 인디케이터 점등
        indOn && indOn.forEach(indicator => {
          let component = gateway.findById(indicator.id);
          if (!component) return;
          if (component.state.boot_flag == "false") return;
          component.store = indicator;
          component.store.biz_type = message.body.biz_type;
          component.store.action_type = message.body.action_type;

          component.setState('org_box_qty', String(("00" + indicator.org_box_qty).substr(-3)));
          component.setState('org_ea_qty', String(("00" + indicator.org_ea_qty).substr(-3)));
          component.setState('buttonColor', String(component.colors[indicator.color] || "black"));

          switch (message["body"]["action_type"]) {
            case component.tasks.PICK:
              component.currentTask = component.tasks.PICK;
              break;
            case component.tasks.STOCK:
              component.currentTask = component.tasks.STOCK;
              break;
            default:
          }

          component.lit = true; // 인디케이터 점등여부 확인용 | 소등시 버튼 반응 없도록
        });
        break;
      case "IND_OFF_REQ":
        if (gateway.state.boot_flag == "false") return;

        gateway.indicators.forEach(indicator => {
          indicator.setState('org_box_qty', String(""));
          indicator.setState('org_ea_qty', String(""));
          indicator.setState('buttonColor', String("black"));

          indicator.lit = false;

          gateway.publisher.data = {
            "properties": gateway.generateMessageProperties(),
            "body": {
              "action": "IND_OFF_RES",
              "id": indicator.model.id,
              "result": true
            }
          }
          console.log("sent IND_OFF_RES", gateway.publisher.data);
        });
        break;
      // 4.4 gateway에 배포 요청
      case "GW_DEP_REQ": // 게이트웨이 펌웨어 업데이트
        if (gateway.state.boot_flag == "false") return;

        // 4.5 firmware download

        // is G/W's firmware update?
        // - 인디케이터 펌웨어 업데이트 프로토콜은 따로임

        //firmware update//
        let isUpdated = false;
        let random = Math.random();
        if (random > 0.5) {
          message.body.ind_url;
          gateway.version = message.body.version;
          isUpdated = true;
        }
        ///////////////////

        ///완료 확인 로직?///
        ////////////////

        gateway.publisher.data = {
          "properties": gateway.generateMessageProperties(),
          "body": {
            "action": "GW_DEP_RES",
            "id": gateway.model.id,
            "result": isUpdated,
            "version": gateway.version,
            "time": Date.now()
          }
        }
        console.log("sent GW_DEP_RES", gateway.publisher.data);

        gateway.off();
        gateway.boot();

        //gateway.publisher.data = null;
        break;
      // 4.4 gateway에 배포 요청
      case "IND_DEP_REQ": // 인디케이터 펌웨어 업데이트
        if (gateway.state.boot_flag == "false") return;

        // 4.5 firmware download//
        //////////////////////////

        // 4.6 indicator에 firmware 전송
        gateway.indicators.forEach(indicator => {
          if (indicator.state.boot_flag == false) return;

          //4.7 firmware 파일 접수//
          ////////////////////////

          //4.8 firmware 업데이트//
          let result;
          if (Math.random() > 0.5) {
            indicator.version = message.body.version;
            result = true;
          } else {
            result = false;
          }
          ///////////////////////

          gateway.publisher.data = {
            properties: gateway.generateMessageProperties(),
            body: {
              action: "IND_DEP_RES",
              id: indicator.model.id,
              result: result,
              version: indicator.version,
              time: Date.now()
            }
          }
          console.log("sent IND_DEP_RES", gateway.publisher.data);
        });
        // boot
        gateway.off();
        gateway.boot();
        break;
      case "TIMESYNC_RES": // 시간 동기화
        if (gateway.state.boot_flag == "false") return;
        gateway.setTimer(message.body.svr_time);
        if (!gateway.time) gateway.timerOn();
        break;
      default:
        console.log("unknown message", message);
    }
  } else {

  }
}
