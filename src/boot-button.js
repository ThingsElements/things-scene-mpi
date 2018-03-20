import { Component, RectPath, Shape } from '@hatiolab/things-scene';
import boot from '../assets/button-start.png';

export const buttons = [{
  icon: boot,
  handler: onclickBoot
}];

const BUTTONS_MARGIN = 10;
const BUTTONS_GAP = 35;
const BUTTONS_RADIUS = 15;

export default class BootButton extends RectPath(Shape) {
  static get image() {
    if (!BootButton._image) {
      BootButton._image = new Image();
      BootButton._image.src = boot;
    }

    return BootButton._image;
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

    context.drawImage(BootButton.image, left, top, width, height);

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
    return buttons.find((button, idx) => {
      return true;
    });
  }
}


function onclickBoot(button) {
  console.log('onclickBoot');
}

Component.register('boot-button', BootButton);

