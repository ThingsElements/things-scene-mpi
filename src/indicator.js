import { Component, RectPath, Shape } from '@hatiolab/things-scene';
import SegmentDisplay from './segment-display';
import IMAGE from './mpi-image';

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
    label: 'value1',
    name: 'value1'
  }, {
    type: 'string',
    label: 'value2',
    name: 'value2'
  }, {
    type: 'select',
    label: 'button color',
    name: 'buttonColor',
    property: {
      options: [{
        display: 'GRAY',
        value: 'gray'
      }, {
        display: 'YELLOW',
        value: 'yellow'
      }, {
        display: 'WHITE',
        value: 'white'
      }, {
        display: 'GREEN',
        value: 'green'
      }, {
        display: 'RED',
        value: '#fd0000'
      }, {
        display: 'CYAN',
        value: 'cyan'
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

  dispose() {
    super.dispose();
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
      value1 = '000',
      value2 = '000'
    } = this.state;

    return [value1, value2].map((value, idx) => {
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
    var highlight = Math.ceil(r / 3);

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
    context.moveTo(highlight, h - r - highlight);
    context.arcTo(highlight, highlight, w - r, 0, r);
    context.lineTo(w - r - highlight, highlight);
    context.strokeStyle = 'white';
    context.globalAlpha = 0.5;
    context.lineWidth = highlight;
    context.stroke();

    context.beginPath();
    context.moveTo(w - r - highlight, highlight);
    context.arcTo(w - highlight, highlight + highlight, w, h, r);
    context.arcTo(w - highlight, h - highlight, highlight, h, r);
    context.arcTo(highlight, h - highlight, highlight + highlight, 0, r);

    context.strokeStyle = 'white';
    context.globalAlpha = 0.3;
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

    var color = this.state.buttonColor || 'cyan';

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
