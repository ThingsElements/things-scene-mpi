const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'number',
    label: 'angle',
    name: 'angle',
    placeholder: '-50 ~ 50'
  }, {
    type: 'number',
    label: 'length to width ratio',
    name: 'ratioLtoW',
    placeholder: '5 ~ 32'
  }, {
    type: 'number',
    label: 'length to spacing ratio',
    name: 'ratioLtoS',
    placeholder: '-5 ~ 5'
  }, {
    type: 'select',
    label: 'digit',
    name: 'digit',
    property: {
      options: Array(12).fill().map((o, i) => i).map(n => {
        return {
          display: n < 10 ? n : n == 10 ? 'Blank' : 'D',
          value: n
        }
      })
    }
  }],
  'value-property': 'digit'
};

import { Component, RectPath, Shape } from '@hatiolab/things-scene';
import { Seven, Digit } from 'seven-segment';

export default class SevenSegment extends RectPath(Shape) {

  _draw(context) {
    var {
      top,
      left,
      height,
      width,
      angle,
      digit,
      ratioLtoS = .5,
      ratioLtoW = 2
    } = this.state;

    var seven = new Seven({
      height,
      angle,
      ratioLtoW,
      ratioLtoS,
      digit
    });

    context.translate(left, top);

    for (let segment of seven.segments) {  //Access the segments A-G
      //'on' specifies if the segment is used for the 'digit' specified
      if (segment.on) {
        context.beginPath();

        let { x, y } = segment.points[0];
        context.moveTo(x, y);

        for (let p of segment.points.slice(1)) {
          let { x, y } = p;
          context.lineTo(x, y);
        }

        context.stroke();
        context.fill();
      } else {
        context.beginPath();

        let { x, y } = segment.points[0];
        context.moveTo(x, y);

        for (let p of segment.points.slice(1)) {
          let { x, y } = p;
          context.lineTo(x, y);
        }

        context.lineTo(x, y);

        context.stroke();
        context.closePath();
      }
    }
  }

  get digit() {
    return this.getState('digit')
  }

  set digit(digit) {
    this.setState('digit', Number(digit) % 12)
  }

  get nature() {
    return NATURE;
  }
}

Component.register('seven-segment', SevenSegment);
