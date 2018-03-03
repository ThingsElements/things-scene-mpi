import { Component, RectPath, Shape } from '@hatiolab/things-scene';
import SegmentDisplay from './segment-display';
import IMAGE from './mpi-image';

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
        value: 'red'
      }, {
        display: 'CYAN',
        value: 'cyan'
      }]
    }
  }]
};

const RECT_BUTTON_COLORS = {
  black: ['black', 'black'],
  white: ['white', 'white'],
  gray: ['gray', 'gray'],
  yellow: ['yellow', 'yellow'],
  green: ['green', 'green'],
  red: ['#fe494b', 'red'],
  cyan: ['cyan', 'cyan']
};

const WIDTH = 449;
const HEIGHT = 53;

const RECT_BUTTON_EDGE = 5;

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

  onclick(e, hint) {
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
      this.setState('buttonColor', ['black', 'white', 'gray', 'yellow', 'red', 'green', 'cyan'][Math.floor(Math.random() * 10) % 7]);
    } else {
      switch (this.mfcButtonContains(x - left, y - top, WRATE, HRATE)) {
        case 'M':
          console.log('clicked', 'M');
          break;
        case 'F':
          console.log('clicked', 'F');
          break;
        case 'C':
          console.log('clicked', 'C');
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
      display.cornerType = SegmentDisplay.RoundedCorner;
      display.colorOn = idx ? '#fd0000' : '#007dfe';
      display.colorOff = '#2c2c2c';

      display.setValue(value);

      return display;
    });
  }

  _drawRectButton(context, WRATE, HRATE, colors) {
    var w = 52 * WRATE;
    var h = 24 * HRATE;
    var r = Math.min(7 * WRATE, 7 * HRATE);

    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;

    context.beginPath();
    context.moveTo(r, 0);
    context.arcTo(w, 0, w, h, r);
    context.arcTo(w, h, 0, h, r);
    context.arcTo(0, h, 0, 0, r);
    context.arcTo(0, 0, w, 0, r);
    context.closePath();

    // context.fillStyle = '#fe494b';
    // context.strokeStyle = 'red';
    context.fillStyle = colors[0];
    context.strokeStyle = colors[1];
    context.fill();
    context.globalAlpha = 0.8;
    context.lineWidth = RECT_BUTTON_EDGE;
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
    this._drawRectButton(context, WRATE, HRATE, RECT_BUTTON_COLORS[color]);

    context.beginPath();
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
