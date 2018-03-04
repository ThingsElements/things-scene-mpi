const IND_ON = 0;
const IND_STATUS = 1;

export function onmessage(indicator, message) {
  console.log('onmessage', message, message[0], message[1]);

  indicator.setState('value1', '0' + String(message[0]));
  indicator.setState('value2', '0' + String(message[1]));
}
