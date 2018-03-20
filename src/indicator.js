import { Component, RectPath, Shape } from '@hatiolab/things-scene';
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
    label: 'org-box-qty',
    name: 'org_box_qty'
  }, {
    type: 'string',
    label: 'org-ea-qty',
    name: 'org_ea_qty'
  }, {
    type: 'string',
    label: 'led-type',
    name: 'led-type'
  }, {
    type: 'select',
    label: 'button color',
    name: 'buttonColor',
    property: {
      options: [{
        display: 'WHITE',
        value: 'white'
      }, {
        display: 'GREEN',
        value: 'green'
      }, {
        display: 'RED',
        value: 'red'
      }, {
        display: 'BLUE',
        value: 'blue'
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

  static get image() {
    if (!Indicator._image) {
      Indicator._image = new Image();
      Indicator._image.src = IMAGE;
    }

    return Indicator._image;
  }

  get colors() {
    return {
      "R": "red",
      "G": "green",
      "B": "blue",
      "W": "white"
    }
  }

  get ledTypes() {
    return {
      "BLINK": "blink", // 깜박
      "ALWAYS": "always"  // 항상
    }
  }

  get tasks() {
    return {
      "PICK": "pick",
      "STOCK": "stock"
    }
  }

  dispose() {
    super.dispose();
  }

  lightOff() {
    this.setState("org_box_qty", "");
    this.setState("org_ea_qty", "");
    this.setState("buttonColor", "black");

    this.lit = false;
  }

  rectButtonContains(x, y, WRATE, HRATE) {
    var left = 290 * WRATE;
    var top = 15 * HRATE;
    var width = 52 * WRATE;
    var height = 24 * HRATE;

    var extend = RECT_BUTTON_EDGE;

    return (x < Math.max(left + width, left) + extend && x > Math.min(left + width, left) - extend
      && y < Math.max(top + height, top) + extend && y > Math.min(top + height, top) - extend);
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

    var { x, y } = this.transcoordC2S(e.offsetX, e.offsetY);

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
      org_box_qty = '',
      org_ea_qty = ''
    } = this.state;

    return [org_box_qty, org_ea_qty].map((value, idx) => {
      var display = new SegmentDisplay(63 * WRATE, 28 * HRATE);

      display.pattern = '###';
      display.displayAngle = 8;
      display.digitHeight = 20;
      display.digitWidth = 11;
      display.digitDistance = 6;
      display.segmentWidth = 1.8;
      display.segmentDistance = 0.2;
      display.segmentCount = SegmentDisplay.SevenSegment;
      display.cornerType = SegmentDisplay.SymmetricCorner;
      display.colorOn = idx ? '#fd0000' : '#007dfe';
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

    var color = this.state.buttonColor || 'black';

    var WRATE = width / WIDTH;
    var HRATE = height / HEIGHT;

    context.translate(left, top);
    context.save();

    context.beginPath();
    context.drawImage(Indicator.image, 0, 0, width, height);

    this._drawMFCButton(context, WRATE, HRATE);

    var displays = this.displays;

    context.translate(135 * WRATE, 12 * HRATE);
    displays[0].draw(context);

    context.translate(75 * WRATE, 0);
    displays[1].draw(context);

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
    return false
  }

  get controls() { }

  get nature() {
    return NATURE;
  }
}

Component.register('indicator', Indicator);
