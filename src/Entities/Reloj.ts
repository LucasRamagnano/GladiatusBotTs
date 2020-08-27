class Reloj {
    relojId: string;

    constructor(idHtml: string) {
        this.relojId = idHtml;
    }

    estasEnCooldDown(): boolean {
        return $('#' + this.relojId).hasClass('ticker');
    }
}