export function onMouseDownMButton(indicator) {
  console.log('onMouseDownButton', 'M');
}

export function onMouseDownFButton(indicator) {
  console.log('onMouseDownButton', 'F');
}

export function onMouseDownCButton(indicator) {
  console.log('onMouseDownButton', 'C');
}

export function onMouseDownBigButton(indicator) {
  indicator.setState('buttonColor', ['black', 'white', 'gray', 'yellow', 'red', 'green', 'cyan'][Math.floor(Math.random() * 10) % 7]);
}