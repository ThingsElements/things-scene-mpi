export function consoleLogger(...args) {
  console.log(Date(), ...args);
}

export function onmessage(gateway, message) {
  if (gateway.state.power_flag == "false") { consoleLogger("got a message when power is off", message); return; }
  if (!message.properties.is_reply) {
    consoleLogger("received " + (message.body.action ? message.body.action : "unknown action"), message);

    //
    gateway.publisher.data =
      gateway.generateReplyMessage(message.properties.id, message.properties.source_id, message.body.action, message.body);
    consoleLogger("sent reply: ", gateway.publisher.data);

    switch (message.body.action) {
      // 2.5 boot response
      case "GW_INIT_RES":
        {
          if (gateway.state.boot_flag == "true") { consoleLogger("Already booted"); return;}

          // 2.6 gateway initialize
          if (!gateway.version) gateway.version = message.body.gw_version;

          gateway.setTimer(parseInt(message.body.svr_time) * 1000);
          gateway.timerOn();
          gateway.startBlinkingLed();
          gateway.startBlinkingLedBar();

          gateway.publisher.data = {
            "properties": gateway.generateMessageProperties(),
            "body": {
              "action": "GW_INIT_RPT",
              "id": gateway.model.id,
              "version": gateway.version
            }
          };
          consoleLogger("sent GW_INIT_RPT", gateway.publisher.data);

          gateway.setState('boot_flag', String("true")); // gw on

          // 2.7 indicator 초기화 요청
          let indConf = message && message.body && message.body.ind_conf;
          let indIds = message && message.body && message.body.ind_id;

          let i = 0;
          // ?? indicator 초기화 모두 완료 ??
          gateway.indicators.forEach((indicator, idx) => {
            // 2.8 indicator 초기화
            // 시뮬레이션 편의용: MPI 아이디 서버에서 부여 //
            if (!indicator.model.id && i < indIds.length && !gateway.findById(indIds[i])) {
              indicator.model.id = indIds[i];
              gateway.root.indexMap[indicator.model.id] = indicator;
              i++;
            }
            ///////////////////////////////////////

            indicator.setState('boot_flag', String("true"));

            if (!indicator.version) indicator.version = message.body.ind_version;

            Object.keys(indConf).forEach(key => {
              if(indicator.conf.hasOwnProperty(key)) {
                indicator.conf[key] = indConf[key];
              }
            });

            // 세그먼트 개수 맞춤
            indicator.setState('segments', new Array(indicator.getConf.seg_role.length).join(','));

            // 2.9 indicator 준비 완료
            gateway.publisher.data = {
              "properties": gateway.generateMessageProperties(),
              "body": {
                "action": "IND_INIT_RPT",
                "id": indicator.model.id,
                "version": indicator.version
              }
            }
            consoleLogger("sent IND_INIT_RPT", gateway.publisher.data);

            // 2.10 indicator ID 소등
            indicator.lightOff();
          });
        }
        // indicator 초기화 모두 완료
        break;
      // 3.3 G/W에 indicator 점등 요청
      case "IND_ON_REQ":
        {
          if (gateway.state.boot_flag == "false") return;

          // 3.4 indicator에 점등 요청
          gateway.indicators.forEach(indicator => {
            indicator.readOnly = message.body.read_only;
          });

          let indicators = message && message.body && message.body.ind_on;

          // 3.5 인디케이터 점등
          indicators && indicators.forEach(indicator => {
            let component = gateway.findById(indicator.id);
            if (!component) return;
            if (component.state.boot_flag == "false") return;

            component.store = indicator;
            component.store.biz_type = message.body.biz_type;
            component.store.action_type = message.body.action_type;
            component.store.ret_args = message.body.ret_args;

            Object.keys(component.conf).forEach(opt => {
              if(indicator.hasOwnProperty(opt)) {
                switch(opt){ // 오버라이드 제외 목록
                  case 'seg_role':
                  case '':
                    return;
                  break;
                }
                component.conf[opt] = indicator[opt];
              }
            });

            let r = indicator.org_relay, b = indicator.org_box_qty, p = indicator.org_ea_qty, c = indicator.color;
            switch (message["body"]["action_type"]) {
              case component.tasks.PICK:
                component.currentTask = component.tasks.PICK;
                break;
              case component.tasks.STOCK:
                component.currentTask = component.tasks.STOCK;
                break;
              case component.tasks.FULL:
                component.currentTask = component.tasks.FULL;
                component.displayMessage("FULFUL", c);
                return;
                break;
              case component.tasks.END:
                component.currentTask = component.tasks.END;
                component.displayMessage("ENDEND", c);
                return;
                break;
              case component.tasks.DISPLAY:
                component.currentTask = component.tasks.DISPLAY;
                c = "K"
                break;
              default:
            }

            let cookedData = {};
            if (r || r >= 0) cookedData.org_relay = r;
            if (b || b >= 0) cookedData.org_box_qty = b;
            if (p || p >= 0) cookedData.org_ea_qty = p;
            if (c) cookedData.buttonColor = component.colors[c];
            if (r || b || p || c) {
              component.jobLightOn(cookedData);
            }
          });
        }
        break;
      case "IND_OFF_REQ":
        {
          if (gateway.state.boot_flag == "false") return;

          gateway.indicators.forEach(indicator => {
            // 인디케이터가 END 상태이면서 end_off_flag가 false이고, force_flag가 false이면 소등 안 함
            if (((indicator.currentTask == indicator.tasks.END) && !message.body.end_off_flag) && !message.body.force_flag) return;

            // 인디케이터의 불이 꺼져있고, 설정의 off_use_res가 false이면 소등 안 함
            if (!indicator.getConf.off_use_res && !indicator.lit) return;

            let ind;
            if (message.body.ind_off) ind = message.body.ind_off.find((element, index) => {
              return element === indicator.model.id;
            });
            if (!ind) return;

            indicator.lightOff();

            gateway.publisher.data = {
              properties: gateway.generateMessageProperties(),
              body: {
                action: "IND_OFF_RES",
                id: indicator.model.id,
                result: true
              }
            }
            consoleLogger("sent IND_OFF_RES", gateway.publisher.data);
          });
        }
        break;
        // 4.4 gateway에 배포 요청
      case "GW_DEP_REQ": // 게이트웨이 펌웨어 업데이트
        {
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
          consoleLogger("sent GW_DEP_RES", gateway.publisher.data);

          gateway.off();
          gateway.boot();
        }
        //gateway.publisher.data = null;
        break;
        // 4.4 gateway에 배포 요청
      case "IND_DEP_REQ": // 인디케이터 펌웨어 업데이트
        {
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
            consoleLogger("sent IND_DEP_RES", gateway.publisher.data);
          });
          // boot
          gateway.off();
          gateway.boot();
        }
        break;
      case "TIMESYNC_RES": // 시간 동기화
        {
          if (gateway.state.boot_flag == "false") return;
          gateway.setTimer(parseInt(message.body.svr_time) * 1000);
          if (!gateway.time) gateway.timerOn();
        }
        break;
      case "MW_MOD_IP_REQ":
        {
          gateway.publisher.data = {
            properties: gateway.generateMessageProperties(),
            body: {
              action: "MW_MOD_IP_RES",
              id: gateway.model.id,
              result: Math.random() > 0.5 ? true : false
            }
          }
        }
        break;
      case "LED_ON_REQ": {
        let ind = gateway.indicators.findIndex((indicator, index) => {
          return indicator.model.id === message.body.id;
        });
        if (ind != -1) {
          Object.keys(gateway.indicators[ind].conf).forEach(opt => {
            if (message.body.hasOwnProperty(opt)) {
              gateway.indicators[ind].conf[opt] = message.body[opt];
            }
          });
          let color = "#f00";
          
          if(gateway.indicators[ind].getConf.led_bar_brtns > 10) gateway.indicators[ind].conf.led_bar_brtns = 10;
          color = color + Math.round(gateway.indicators[ind].getConf.led_bar_brtns * 15 / 10).toString(16)

          gateway.indicators[ind].ledRect.strokeStyle = color;
          gateway.indicators[ind].ledLit = true;
        } else consoleLogger("Could not find indicator", message.body.id);
      } break;
      case "LED_OFF_REQ": {
        let ind = gateway.indicators.findIndex((indicator, index) => {
          return indicator.model.id === message.body.id;
        });
        if (ind != -1) {
          gateway.indicators[ind].ledRect.strokeStyle = "#0000";
          gateway.indicators[ind].ledLit = false;
        } else consoleLogger("Could not find indicator", message.body.id);
      } break;
      default:
        console.log("unknown message", message);
    }
  } else {
    consoleLogger("server reply: ", message);
  }
}
