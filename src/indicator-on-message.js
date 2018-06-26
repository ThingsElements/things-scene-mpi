const IND_ON = 0;
const IND_STATUS = 1;

export function onmessage(indicator, message) {
  indicator.lightOn(message);
  indicator.data.dataChanged = false;
}
