import icon from '../assets/no-image.png';

export default {
  type: 'boot-button',
  description: 'all gateway boot',
  group: 'IoT',
  /* line|shape|textAndMedia|chartAndGauge|table|container|dataSource|IoT|3D|warehouse|form|etc */
  icon,
  model: {
    type: 'boot-button',
    left: 100,
    top: 100,
    width: 500,
    height: 500,
    fillStyle: 'transparent',
    strokeStyle: 'transparent'
  }
};
