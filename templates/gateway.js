import icon from '../assets/no-image.png';

export default {
  type: 'gateway',
  description: 'multi-purpose indicator gateway',
  group: 'IoT',
  /* line|shape|textAndMedia|chartAndGauge|table|container|dataSource|IoT|3D|warehouse|form|etc */
  icon,
  model: {
    type: 'gateway',
    left: 10,
    top: 10,
    width: 800,
    height: 600,
    fillStyle: 'cyan',
    strokeStyle: 'darkgray'
  }
};
