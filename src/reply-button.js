import { Component, RectPath, Shape } from '@hatiolab/things-scene';
import reply from '../assets/reply-button.png';

import { consoleLogger } from './gateway-on-message';

export const buttons = [{
  icon: reply,
  handler: onClickReply
}];

const BUTTONS_MARGIN = 10;
const BUTTONS_GAP = 35;
const BUTTONS_RADIUS = 15;

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

export default class ReplyButton extends RectPath(Shape) {
  static get image() {
    if (!ReplyButton._image) {
      ReplyButton._image = new Image();
      ReplyButton._image.src = reply;
    }

    return ReplyButton._image;
  }

  get publisher() {
    if (this.state.publisher) {
      return this.root.indexMap[this.state.publisher];
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

    context.drawImage(ReplyButton.image, left, top, width, height);

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

  buttonContains(x, y) {
    return buttons[0];
  }

  get nature() {
    return NATURE;
  }
}


function onClickReply(button) {
  consoleLogger('onClickReply');
}

Component.register('reply-button', ReplyButton);

