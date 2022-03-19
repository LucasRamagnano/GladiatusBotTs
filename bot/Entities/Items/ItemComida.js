class ItemComida {
    constructor() {
        this.tipo_class = 'ItemComida';
    }
    fromJsonString(guardado) {
        return this;
    }
    getCalidad() {
        return QualityItemControler.getWhiteQuality();
    }
    getHtmlElement() {
        return this.htmlElement;
    }
    getTipo() {
        return ItemTypes.ItemComida;
    }
    setHtmlElement(elem) {
        this.htmlElement = elem;
    }
}
