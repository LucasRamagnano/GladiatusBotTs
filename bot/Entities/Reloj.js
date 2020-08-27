class Reloj {
    constructor(idHtml) {
        this.relojId = idHtml;
    }
    estasEnCooldDown() {
        return $('#' + this.relojId).hasClass('ticker');
    }
}
