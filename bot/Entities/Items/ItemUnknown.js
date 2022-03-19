class ItemUnknown {
    constructor() {
        this.tipo_class = 'ItemUnknown';
    }
    fromJsonString(guardado) {
        return this;
    }
    getCalidad() {
        return QualityItemControler.getWhiteQuality();
    }
    getTipo() {
        return ItemTypes.ItemUnknown;
    }
    setHtmlElement(elem) {
        this.htmlElement = elem;
    }
    getHtmlElement() {
        return this.htmlElement;
    }
}
