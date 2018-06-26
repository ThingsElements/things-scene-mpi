import { Component, RectPath, Shape } from '@hatiolab/things-scene';
import { consoleLogger } from './gateway-on-message';

const BUTTONS_MARGIN = 10;
const BUTTONS_GAP = 35;
const BUTTONS_RADIUS = 15;

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'select',
    name: 'switch',
    label: 'Switch',
    placeholder: 'false',
    property: {
      options: [{
        display: 'OFF',
        value: 'false'
      }, {
        display: 'ON',
        value: 'true'
      }]
    }
  }, {
    type: 'string',
    name: 'target',
    label: 'target',
    placeholder: ''
  }, {
    type: 'number',
    name: 'interval',
    label: 'interval',
    placeholder: 0
  }]
};

export default class AutoClicker extends RectPath(Shape) {
  dispose() {
    clearInterval(this.autoClicker);
    delete this.autoClicker;
    super.dispose();
  }

  _draw(context) {
    var {
      left,
      top,
      width,
      height
    } = this.bounds;

    context.beginPath();

    context.rect(left, top, width, height);

    this.drawFill(context);
    this.drawStroke(context);
  }

  onmousedown(e, hint) {
    var autoClicker = () => { 
      this.autoClicker = setTimeout(() => {
        target.onmousedown(e, hint);
        autoClicker();
      }, interval);
    };

    var pp = { true: true, false: false };
    var currentSwitchState = pp[this.getState('switch')];
    var interval = this.getState('interval');
    var target = this.root.findById(this.getState('target'));

    this.setState('switch', !currentSwitchState);
    currentSwitchState = !currentSwitchState;

    this.text = currentSwitchState ? 'ON' : 'OFF';
    this.fontColor = currentSwitchState ? 'rgb(0, 173, 31)' : 'rgb(254, 3, 3)';
    consoleLogger('Auto response:', currentSwitchState);

    if (currentSwitchState && target && interval >= 1000) {
      autoClicker();
    } else {
      clearTimeout(this.autoClicker);
    }
  }

  get nature() {
    return NATURE;
  }
}

Component.register('auto-clicker', AutoClicker);

