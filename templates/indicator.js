export default {
  name: 'indicator',
  /* 다국어 키 표현을 어떻게.. */
  description: '...',
  /* 다국어 키 표현을 어떻게.. */
  group: 'IoT',
  /* line|shape|textAndMedia|chartAndGauge|table|container|dataSource|IoT|3D|warehouse|form|etc */
  icon: '../',
  template: {
    type: 'indicator',
    model: {
      type: 'indicator',
      left: 10,
      top: 10,
      width: 449,
      height: 53,
      fillStyle: 'black',
      strokeStyle: 'darkgray'
    }
  }
};
