import {
  Component,
  RectPath,
  Shape
} from '@hatiolab/things-scene';
import SegmentDisplay from './segment-display';
import IMAGE from '../assets/indicator.png';

import {
  onMouseDownMButton,
  onMouseDownFButton,
  onMouseDownCButton,
  onMouseDownBigButton
} from './indicator-user-action';

import {
  onmessage
} from './indicator-on-message';

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'string',
    label: 'segments',
    name: 'segments'
  }, {
    type: 'select',
    label: 'button color',
    name: 'buttonColor',
    property: {
      options: [{
        display: 'YELLOW',
        value: '#ff0'
      }, {
        display: 'GREEN',
        value: '#0f0'
      }, {
        display: 'RED',
        value: '#f00'
      }, {
        display: 'BLUE',
        value: '#00f'
      }]
    }
  }, {
    type: 'select',
    label: 'boot-flag',
    name: 'boot_flag',
    property: {
      options: [{
        display: 'TRUE',
        value: 'true'
      }, {
        display: 'FALSE',
        value: 'false'
      }]
    }
  }]
};

const WIDTH = 449;
const HEIGHT = 53;

const RECT_BUTTON_EDGE = 3;

export default class Indicator extends RectPath(Shape) {

  constructor(...args) {
    super(...args);

    this.lit = false;
    this.ledLit = false;
    this.store = {};
    this.conf = {
      seg_role: ['B', 'P'],
      alignment: 'R',
      btn_mode: 'S',
      btn_intvl: 5,
      bf_on_msg: '',
      bf_on_msg_t: 10,
      bf_on_delay: 10,
      cncl_delay: 10,
      blink_if_full: true,
      off_use_res: false,
      led_bar_mode: 'S',
      led_bar_intvl: 5,
      led_bar_brtns: 6
    };
    this.currentTask = 'ready';
  }

  static get image() {
    if (!Indicator._image) {
      Indicator._image = new Image();
      Indicator._image.src = IMAGE;
    }

    return Indicator._image;
  }

  get colors() {
    return {
      R: "#f00",
      G: "#0f0",
      B: "#00f",
      C: "#0ff",
      M: "#f0f",
      Y: "#ff0",
      K: "#0000",
      W: "#fff"
    }
  }

  get btnModes() {
    return {
      BLINK: "B", // 깜박
      ALWAYS: "S" // 항상
    }
  }

  get tasks() {
    return {
      PICK: "pick",
      STOCK: "stock",
      FULL: "full",
      END: "end",
      DISPLAY: "display",
      READY: "ready"
    }
  }

  get alignmentOptions() {
    return {
      LEFT: "L",
      RIGHT: "R"
    }
  }

  get segmentRoles() {
    return {
      RELAY_SEQ: {
        INITIAL: 'R', 
        KEY: 'org_relay'
      }, 
      BOXES: {
        INITIAL: 'B',
        KEY: 'org_box_qty'
      }, 
      PCS: {
        INITIAL: 'P',
        KEY: 'org_ea_qty'
      }
    }
  }

  get getConf() {
    return this.conf;
  }

  set setConf(conf) {
    this.conf = conf
  }

  get gateway() {
    var gateway = this.parent;
    while (gateway.constructor.name !== ("Gateway" || "Window")) {
      gateway = gateway.parent;
    };

    if (gateway.constructor.name === "Window") return;

    return gateway;
  }

  get ledRect() {
    return this.parent.findFirst('rect') || {};
  }

  dispose() {
    super.dispose();
  }

  /**
   * 
   * @param {array} args 
   */
  setSegmentsState(args) {
    var stateArr = [];
    
    var currentRole = this.store.seg_role? this.store.seg_role: this.getConf.seg_role;
    currentRole.forEach(role => {
      var ele;
      args.forEach(arg => {
        if (role == arg.role && (arg.value || arg.value >= 0)) {
          ele = arg.value;
        }
      });
      stateArr.push(ele);
    });
    var stateStr = stateArr.join(',');
    this.setState('segments', stateStr);
  }

  /**
   * 
   * @param {object} data 
   */
  jobLightOn(data, lit = true) {
    var toutDisplayMessage = (indicator) => {
      indicator.displayMessage(indicator.getConf.bf_on_msg, 'K', false);
      setTimeout(() => {
        toutDelayBeforeLightOn(indicator);
      }, indicator.getConf.bf_on_msg_t * 100);
    };

    var toutDelayBeforeLightOn = (indicator) => {
      indicator.lightOff();
      setTimeout(() => {
        indicator.lightOn(data, lit);
      }, indicator.getConf.bf_on_delay * 100);
    };
    
    if(typeof this.getConf.bf_on_msg === 'string' && this.getConf.bf_on_msg.length > 0) {
      toutDisplayMessage(this);
    } else if (this.getConf.bf_on_delay > 0) {
      toutDelayBeforeLightOn(this);
    } else {
      this.lightOn(data, lit);
    }
  }

  /**
   * 
   * @param {object} data 
   */
  lightOn(data, lit = true) {
    var sublen = parseInt(6 / this.getConf.seg_role.length);
    switch (this.getConf.alignment) {
      case this.alignmentOptions.LEFT: {
        let arr = [];
        Object.values(this.segmentRoles).forEach(role => {
          if(data[role.KEY] || data[role.KEY] >= 0) {
            var obj = {
              role: role.INITIAL,
              value: data[role.KEY]
            };
            arr.push(obj);
          }
        });
        this.setSegmentsState(arr);
      } break;
      case this.alignmentOptions.RIGHT:
      default: {
        let arr = [];
        Object.values(this.segmentRoles).forEach(role => {
          if (data[role.KEY] || data[role.KEY] >= 0) {
            var obj = {
              role: role.INITIAL,
              value: ("  " + data[role.KEY]).substr(-sublen)
            };
            arr.push(obj);
          }
        });
        this.setSegmentsState(arr);
      } break;
    }
    if (data.buttonColor) this.setState('buttonColor', String(data.buttonColor));
    this.lit = lit;
  }

  lightOff() {
    this.setState("segments", this.displays.length == 3 ? ',,': ',');
    this.setState("buttonColor", "#0000");
    
    this.lit = false;
  }

  /**
   * 
   * @param {string} msg 
   * @param {string} color 
   */
  displayMessage(msg, color = 'K', lit = true) {
    var eachSegLen = this.displays[0].pattern.length;
    var allSegLen = eachSegLen * this.displays.length;

    var d = msg? msg : this.getConf.bf_on_msg;

    switch(this.conf.alignment) {
      case this.alignmentOptions.LEFT: {
        d = (d + "      ").substr(0, allSegLen);
      } break;
      case this.alignmentOptions.RIGHT:
      default : {
        d = ("      " + d).substr(-allSegLen);
      } break;
    }

    var da = [];

    var i = 1;
    var startIdx = 0;
    while(i <= allSegLen) {
      if(i % eachSegLen == 0) {
        da.push(d.substr(startIdx, eachSegLen));
        startIdx = i;
      }
      i++;
    }
    this.setState("segments", da.join(','));
    this.setState("buttonColor", this.colors[color]);
    this.lit = lit;
  }

  rectButtonContains(x, y, WRATE, HRATE) {
    var left = 290 * WRATE;
    var top = 15 * HRATE;
    var width = 52 * WRATE;
    var height = 24 * HRATE;

    var extend = RECT_BUTTON_EDGE;

    return (x < Math.max(left + width, left) + extend && x > Math.min(left + width, left) - extend &&
      y < Math.max(top + height, top) + extend && y > Math.min(top + height, top) - extend);
  }

  mfcButtonContains(x, y, WRATE, HRATE) {
    var rx = 7 * WRATE;
    var ry = 7 * HRATE;

    var cx = 96 * WRATE;
    var cy = 27 * HRATE;
    var normx = (x - cx) / (rx * 2 - 0.5);
    var normy = (y - cy) / (ry * 2 - 0.5);

    if ((normx * normx + normy * normy) < 0.25) {
      return 'M';
    }

    cx = 113 * WRATE;
    cy = 16 * HRATE;
    normx = (x - cx) / (rx * 2 - 0.5);
    normy = (y - cy) / (ry * 2 - 0.5);

    if ((normx * normx + normy * normy) < 0.25) {
      return 'F';
    }

    cx = 113 * WRATE;
    cy = 38 * HRATE;
    normx = (x - cx) / (rx * 2 - 0.5);
    normy = (y - cy) / (ry * 2 - 0.5);

    if ((normx * normx + normy * normy) < 0.25) {
      return 'C';
    }
  }

  onmousedown(e, hint) {
    var {
      left,
      top,
      width,
      height
    } = this.bounds;

    var WRATE = width / WIDTH;
    var HRATE = height / HEIGHT;

    var {
      x,
      y
    } = this.transcoordC2S(e.offsetX, e.offsetY);

    if (this.rectButtonContains(x - left, y - top, WRATE, HRATE)) {
      onMouseDownBigButton(this);
    } else {
      switch (this.mfcButtonContains(x - left, y - top, WRATE, HRATE)) {
        case 'M':
          onMouseDownMButton(this);
          break;
        case 'F':
          onMouseDownFButton(this);
          break;
        case 'C':
          onMouseDownCButton(this);
          break;
        default:
      }
    }
  }

  get displays() {
    var {
      width,
      height
    } = this.bounds;

    var WRATE = width / WIDTH;
    var HRATE = height / HEIGHT;

    var {
      segments = new Array(this.getConf.seg_role.length).join(',')
    } = this.state;

    return segments.split(',', 3).map((value, idx, array) => {
      var display = new SegmentDisplay(63 * WRATE, 28 * HRATE);

      display.pattern = 
        array.length == 2 ? '###' : 
        array.length == 3 ? '##' : 
        ''; // 3 넘는 건 안 함
      display.displayAngle = 8;
      display.digitHeight = 20;
      display.digitWidth = 11;
      display.digitDistance = 6;
      display.segmentWidth = 1.8;
      display.segmentDistance = 0.2;
      display.segmentCount = SegmentDisplay.SevenSegment;
      display.cornerType = SegmentDisplay.SymmetricCorner;
      display.colorOn = idx == 0 ? '#007dfe' : idx == 1 ? '#fd0000' : '#fee400';
      display.colorOff = '#2c2c2c';

      display.setValue(value);

      return display;
    });
  }

  _drawRectButton(context, WRATE, HRATE, color) {
    var w = 52 * WRATE;
    var h = 24 * HRATE;
    var r = Math.min(7 * WRATE, 7 * HRATE);
    var edge = Math.floor(r / 2);
    var highlight = Math.floor(r / 5);

    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;

    context.beginPath();
    context.moveTo(r, 0);
    context.arcTo(w, 0, w, h, r);
    context.arcTo(w, h, 0, h, r);
    context.arcTo(0, h, 0, 0, r);
    context.arcTo(0, 0, w, 0, r);

    context.globalAlpha = 1;
    context.fillStyle = color;
    context.strokeStyle = color;
    context.lineWidth = edge;
    context.fill();
    context.stroke();
    context.strokeStyle = 'black';
    context.globalAlpha = 0.3;
    context.stroke();

    context.beginPath();
    context.moveTo(highlight, h - r);
    context.arcTo(highlight, highlight, r, highlight, r - highlight);
    context.lineTo(w - r, highlight);
    context.strokeStyle = 'white';
    context.globalAlpha = 0.6;
    context.lineWidth = highlight;
    context.stroke();

    context.beginPath();
    context.moveTo(w - r, highlight);
    context.arcTo(w - highlight, highlight, w - highlight, r, r - highlight);
    context.arcTo(w - highlight, h - highlight, w - r, h - highlight, r - highlight);
    context.arcTo(highlight, h - highlight, highlight, h - r, r - highlight);

    context.strokeStyle = 'white';
    context.globalAlpha = 0.4;
    context.lineWidth = highlight;
    context.stroke();

    context.globalAlpha = 1;
  }

  _drawMFCButton(context, WRATE, HRATE) {
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = `bold ${Math.min(10 * WRATE, 10 * HRATE)}px Arial`;

    context.beginPath();
    context.ellipse(96 * WRATE, 27 * HRATE, 7 * WRATE, 7 * HRATE, 0, 0, 2 * Math.PI);
    context.fillStyle = 'white';
    context.fill();

    context.fillStyle = '#a8a8a8';
    context.fillText('M', 96 * WRATE, 27 * HRATE);

    context.beginPath();
    context.ellipse(113 * WRATE, 16 * HRATE, 7 * WRATE, 7 * HRATE, 0, 0, 2 * Math.PI);
    context.fillStyle = 'white';
    context.fill();

    context.fillStyle = '#a8a8a8';
    context.fillText('F', 113 * WRATE, 16 * HRATE);

    context.beginPath();
    context.ellipse(113 * WRATE, 38 * HRATE, 7 * WRATE, 7 * HRATE, 0, 0, 2 * Math.PI);
    context.fillStyle = 'white';
    context.fill();

    context.fillStyle = '#a8a8a8';
    context.fillText('C', 113 * WRATE, 38 * HRATE);
  }

  _draw(context) {
    var {
      left,
      top,
      width,
      height
    } = this.bounds;

    var color = this.state.buttonColor || '#0000';

    var WRATE = width / WIDTH;
    var HRATE = height / HEIGHT;

    context.translate(left, top);
    context.save();

    context.beginPath();
    context.drawImage(Indicator.image, 0, 0, width, height);

    this._drawMFCButton(context, WRATE, HRATE);

    var displays = this.displays;

    var myCursor = displays.length == 3 ? 1 : 0;

    context.translate((135 - (myCursor * 12)) * WRATE, 12 * HRATE);
    displays[0].draw(context);

    if(displays.length >= 2) {
      context.translate((75 - (myCursor * 25)) * WRATE, 0);
      displays[1].draw(context);
    }

    if(displays.length >= 3) {
      context.translate((75 - (myCursor * 25)) * WRATE, 0);
      displays[2].draw(context);
    }
    
    context.beginPath();

    context.restore();
    context.translate(290 * WRATE, 15 * HRATE);
    this._drawRectButton(context, WRATE, HRATE, color);

    context.beginPath();
  }

  onchangeData(after, before) {
    super.onchangeData(after, before);

    onmessage(this, after.data);
  }

  get hasTextProperty() {
    return false;
  }

  get controls() {}

  get nature() {
    return NATURE;
  }

  onButton() {
    switch (this.currentTask) {
      case this.tasks.FULL: {
        onMouseDownFButton(this);
      } break;
      default: {
        onMouseDownBigButton(this);
      } break;
    }

  }
}

Component.register('indicator', Indicator);
