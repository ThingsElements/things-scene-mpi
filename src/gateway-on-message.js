export function onmessage(gateway, message) {

  var indicators = message && message.body && message.body.ind_on;

  indicators && indicators.forEach(indicator => {
    let component = gateway.findById(indicator.id);

    component.setState('org_box_qty', String(indicator.org_box_qty));
    component.setState('org_ea_qty', String(indicator.org_ea_qty));
    component.setState('buttonColor', String(indicator.color));
  });
}
