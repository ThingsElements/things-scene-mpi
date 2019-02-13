import icon from "../assets/no-image.png";

export default {
  type: "seven-segment",
  description: "electric seven segment emulator",
  group: "IoT",
  /* line|shape|textAndMedia|chartAndGauge|table|container|dataSource|IoT|3D|warehouse|form|etc */
  icon,
  model: {
    type: "seven-segment",
    left: 10,
    top: 10,
    width: 200,
    height: 300,
    fillStyle: "black",
    strokeStyle: "darkgray",
    pattern: "##:##:##",
    value: "12:34:56",
    digitHeight: 20,
    digitWidth: 10,
    digitDistance: 2.5,
    displayAngle: 12,
    segmentWidth: 2.5,
    segmentDistance: 0.2,
    segmentCount: 7,
    cornerType: 0,
    colorOn: "rgb(233, 93, 15)",
    colorOff: "rgb(75, 30, 5)"
  }
};
