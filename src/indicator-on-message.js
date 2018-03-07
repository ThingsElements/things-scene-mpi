const IND_ON = 0;
const IND_STATUS = 1;

export function onmessage(indicator, message) {
  console.log('onmessage', message);

  indicator.setState('org_box_qty', String(message.org_box_qty));
  indicator.setState('org_ea_qty', String(message.org_ea_qty));
  indicator.setState('buttonColor', String(message.color));
}
