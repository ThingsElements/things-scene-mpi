import { Component, Container } from '@hatiolab/things-scene';
import IMAGE from '../assets/gateway.png';

import {
  buttons
} from './gateway-on-button';

import {
  onmessage
} from './gateway-on-message';

const BUTTONS_MARGIN = 10;
const BUTTONS_GAP = 35;
const BUTTONS_RADIUS = 15;
const BUTTOMS_ICON_SIZE = 24;

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'string',
    name: 'publisher',
    label: 'publisher'
  }]
};

export default class Gateway extends Container {

  static get image() {
    if (!Gateway._image) {
      Gateway._image = new Image();
      Gateway._image.src = IMAGE;
    }

    return Gateway._image;
  }

  static get buttonImages() {
    if (!Gateway._buttonImages) {
      Gateway._buttonImages = [];

      buttons.forEach(button => {
        let image = new Image();
        image.src = button.icon;

        Gateway._buttonImages.push(image);
      });
    }

    return Gateway._buttonImages;
  }

  dispose() {
    super.dispose();
  }

  buttonContains(x, y) {
    var rx = BUTTONS_RADIUS;
    var ry = BUTTONS_RADIUS;

    return buttons.find((button, idx) => {
      let cx = idx * BUTTONS_GAP + BUTTONS_RADIUS / 2;
      let cy = BUTTONS_RADIUS;

      let normx = (x - cx) / (rx * 2 - 0.5);
      let normy = (y - cy) / (ry * 2 - 0.5);

      return (normx * normx + normy * normy) < 0.25;
    });
  }

  passIndicatorsMessage(indicatorMessage) {
    if (!indicatorMessage) this.publisher.data.properties = this.generateMessageProperties();
    else this.publisher.data = {
      "properties": this.generateMessageProperties(),
      "body": indicatorMessage
    }
  }

  generateMessageProperties() {
    return {
      "id": ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      ),
      "time": Date.now(),
      "dest_id": "mps_server",
      "source_id": this.id,
      "is_reply": false
    };
  }

  generateReplyMessage(messageId, sourceId) {
    return {
      "properties": {
        "id": messageId,
        "time": Date.now(),
        "dest_id": sourceId,
        "source_id": this.id,
        "is_reply": true
      }
    }
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

    context.drawImage(Gateway.image, left + width - 62 - 5, top + 5, 62, 32);

    Gateway.buttonImages.forEach((image, idx) => {
      context.beginPath();

      if (buttons[idx] === this._focusedButton) {
        context.ellipse(BUTTONS_MARGIN + left + idx * BUTTONS_GAP + BUTTOMS_ICON_SIZE / 2, BUTTONS_MARGIN + top + BUTTOMS_ICON_SIZE / 2, BUTTONS_RADIUS, BUTTONS_RADIUS, 0, 0, 2 * Math.PI);
        context.fillStyle = 'lightgray';
        context.fill();
      }

      context.drawImage(image, BUTTONS_MARGIN + left + idx * BUTTONS_GAP, BUTTONS_MARGIN + top, BUTTOMS_ICON_SIZE, BUTTOMS_ICON_SIZE);
    });
  }

  get indicators() {
    return this.findAll('indicator');
  }

  get publisher() {
    if (this.state.publisher) {
      return this.findById(this.state.publisher)
    }
  }

  onchangeData(after, before) {
    super.onchangeData(after, before);

    onmessage(this, after.data);
  }

  onmousedown(e, hint) {
    var {
      left,
      top,
      width,
      height
    } = this.bounds;

    var { x, y } = this.transcoordC2S(e.offsetX, e.offsetY);

    var button = this.buttonContains(x - left - BUTTONS_MARGIN, y - top - BUTTONS_MARGIN);
    if (button) {
      button.handler(this);
    }
  }

  onmousemove(e, hint) {
    var {
      left,
      top,
      width,
      height
    } = this.bounds;

    var { x, y } = this.transcoordC2S(e.offsetX, e.offsetY);

    var old = this._focusedButton;
    this._focusedButton = this.buttonContains(x - left - BUTTONS_MARGIN, y - top - BUTTONS_MARGIN);
    if (this._focusedButton !== old) {
      this.invalidate();
    }
  }

  get hasTextProperty() {
    return false
  }

  get controls() { }

  get nature() {
    return NATURE;
  }
}

Component.register('gateway', Gateway);
