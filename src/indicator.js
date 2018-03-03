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

const WIDTH = 449;
const HEIGHT = 53;

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

  _drawButton(context, WRATE, HRATE, color) {
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
    context.fillStyle = color;
    context.strokeStyle = color;
    context.fill();
    context.globalAlpha = 0.8;
    context.lineWidth = 5;
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
    this._drawButton(context, WRATE, HRATE, color);

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
