function crearPackDesdeTr(elemento) {
    let nombreDuenio = $(elemento).find('td')[1].textContent.trim();
    let valor = Number.parseInt($(elemento).find('td')[2].textContent.trim().replace(/\./g, ''));
    let nivel = Number.parseInt($(elemento).find('td')[4].textContent.trim());
    let idItem = Number.parseInt($(elemento).find('td div')[0].getAttribute('data-item-id'));
    let dataTooltip = $(elemento).find('td div')[0].getAttribute('data-tooltip');
    let idOAlgoAsi = dataTooltip.substring(0, dataTooltip.indexOf('icon_gold'));
    let link = $(elemento).find('td input')[0];
    return new Paquete(idOAlgoAsi, idItem, nombreDuenio, valor, nivel, link);
}
