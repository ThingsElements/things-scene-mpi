import { Component, RectPath, Shape } from '@hatiolab/things-scene';

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  // properties: [{
  //   type: 'string',
  //   label: 'broker',
  //   name: 'broker',
  //   property: 'broker',
  //   placeholder: 'WebSocket hostname'
  // }, {
  //   type: 'number',
  //   label: 'port',
  //   name: 'port',
  //   property: 'port',
  //   placeholder: '15675'
  // }, {
  //   type: 'string',
  //   label: 'path',
  //   name: 'path',
  //   property: 'path',
  //   placeholder: '/mqtt or /ws'
  // }, {
  //   type: 'string',
  //   label: 'user',
  //   name: 'user',
  //   property: 'user'
  // }, {
  //   type: 'string',
  //   label: 'password',
  //   name: 'password',
  //   property: 'password'
  // }, {
  //   type: 'string',
  //   label: 'topic',
  //   name: 'topic',
  //   property: 'topic'
  // }, {
  //   type: 'number',
  //   label: 'qos',
  //   name: 'qos',
  //   property: 'qos',
  //   placeholder: '0..2'
  // }, {
  //   type: 'string',
  //   label: 'client-id',
  //   name: 'clientId',
  //   property: 'clientId'
  // }, {
  //   type: 'select',
  //   label: 'data-format',
  //   name: 'dataFormat',
  //   property: {
  //     options: [{
  //       display: 'Plain Text',
  //       value: 'text'
  //     }, {
  //       display: 'JSON',
  //       value: 'json'
  //     }]
  //   }
  // }, {
  //   type: 'checkbox',
  //   label: 'retain',
  //   name: 'retain',
  //   property: 'retain'
  // }, {
  //   type: 'checkbox',
  //   label: 'ssl',
  //   name: 'ssl',
  //   property: 'ssl'
  // }]
}

export default class Indicator extends RectPath(Shape) {

  dispose() {
    super.dispose();
  }

  _draw(context) {
    var {
      top,
      left,
      height,
      width
    } = this.model;

    context.beginPath();

    context.rect(left, top, width, height);
  }

  // _post_draw(context) {
  //   this.drawStroke(context);
  //   this.drawText(context);
  // }

  get controls() { }

  get nature() {
    return NATURE;
  }
}

Component.register('indicator', Indicator);
