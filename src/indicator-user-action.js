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
  console.log('onMouseDownBigButton');
  indicator.parent.passIndicatorsMessage({
    "action": "IND_STATUS_RPT",
    "ind_status": {
      "id": indicator.id,
      "version": "Things-shell MPI Simulator 0.1.0"
    }
  });
  indicator.setState('buttonColor', ['black', 'white', 'gray', 'yellow', 'red', 'green', 'cyan'][Math.floor(Math.random() * 10) % 7]);
}