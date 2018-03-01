const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'string',
    label: 'value',
    name: 'value',
    placeholder: '12:34:56'
  }, {
    type: 'string',
    label: 'pattern',
    name: 'pattern',
    placeholder: '##:##:##'
  }, {
    type: 'number',
    label: 'digit height',
    name: 'digitHeight',
    placeholder: '20'
  }, {
    type: 'number',
    label: 'digit width',
    name: 'digitWidth',
    placeholder: '10'
  }, {
    type: 'number',
    label: 'digit distance',
    name: 'digitDistance',
    placeholder: '2.5'
  }, {
    type: 'number',
    label: 'display angle',
    name: 'displayAngle',
    placeholder: '12'
  }, {
    type: 'number',
    label: 'segment width',
    name: 'segmentWidth',
    placeholder: '2.5'
  }, {
    type: 'number',
    label: 'segment distance',
    name: 'segmentDistance',
    placeholder: '0.2'
  }, {
    type: 'select',
    label: 'segment count',
    name: 'segmentCount',
    property: {
      options: [{
        display: 7,
        value: 7
      }, {
        display: 14,
        value: 14
      }, {
        display: 16,
        value: 16
      }]
    }
  }, {
    type: 'select',
    label: 'corner type',
    name: 'cornerType',
    property: {
      options: [{
        display: 'SymmetricCorner',
        value: 0
      }, {
        display: 'SquaredCorner',
        value: 1
      }, {
        display: 'RoundedCorner',
        value: 2
      }]
    }
  }, {
    type: 'color',
    label: 'color-on',
    name: 'colorOn'
  }, {
    type: 'color',
    label: 'color-off',
    name: 'colorOff'
  }],
  'value-property': 'value'
};

import { Component, RectPath, Shape } from '@hatiolab/things-scene';
import SegmentDisplay from './segment-display';

export default class SevenSegment extends RectPath(Shape) {

  _draw(context) {
    var {
      top,
      left,
      height,
      width,
      pattern = '##:##:##',
      value = '12:34:56',
      digitHeight = 20,
      digitWidth = 10,
      digitDistance = 2.5,
      displayAngle = 12,
      segmentWidth = 2.5,
      segmentDistance = 0.2,
      segmentCount = SegmentDisplay.SevenSegment,
      cornerType = SegmentDisplay.RoundedCorner,
      colorOn = 'rgb(233, 93, 15)',
      colorOff = 'rgb(75, 30, 5)'
    } = this.state;

    var display = new SegmentDisplay(width, height);
    display.pattern = pattern;
    display.displayAngle = displayAngle;
    display.digitHeight = digitHeight;
    display.digitWidth = digitWidth;
    display.digitDistance = digitDistance;
    display.segmentWidth = segmentWidth;
    display.segmentDistance = segmentDistance;
    display.segmentCount = segmentCount;
    display.cornerType = cornerType;
    display.colorOn = colorOn;
    display.colorOff = colorOff;

    display.setValue(String(value));

    context.translate(left, top);
    context.beginPath();

    display.draw(context);
  }

  get nature() {
    return NATURE;
  }
}

Component.register('seven-segment', SevenSegment);
