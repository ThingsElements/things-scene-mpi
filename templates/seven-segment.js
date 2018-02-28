export default {
  name: 'seven-segment',
  /* 다국어 키 표현을 어떻게.. */
  description: '...',
  /* 다국어 키 표현을 어떻게.. */
  group: 'IoT',
  /* line|shape|textAndMedia|chartAndGauge|table|container|dataSource|IoT|3D|warehouse|form|etc */
  icon: '../',
  template: {
    type: 'seven-segment',
    model: {
      type: 'seven-segment',
      left: 10,
      top: 10,
      width: 200,
      height: 300,
      fillStyle: 'black',
      strokeStyle: 'darkgray',
      angle: 10,
      ratioLtoW: 4.5,
      ratioLtoS: 32
    }
  }
}
