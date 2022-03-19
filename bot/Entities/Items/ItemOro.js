class ItemOro {
    constructor(oroValor) {
        this.tipo_class = 'ItemOro';
        this.oroValor = 0;
        this.oroValor = oroValor;
    }
    getTipo() {
        return ItemTypes.ItemOro;
    }
    fromJsonString(guardado) {
        this.oroValor = guardado.oroValor;
        return this;
    }
    getCalidad() {
        return QualityItemControler.getWhiteQuality();
    }
    setHtmlElement(elem) {
        this.htmlElement = elem;
    }
    getHtmlElement() {
        return this.htmlElement;
    }
}
