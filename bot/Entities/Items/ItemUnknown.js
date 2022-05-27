class ItemUnknown {
    constructor(rawData) {
        this.tipo_class = 'ItemUnknown';
        this.rawData = rawData;
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
    esAgarrable() {
        return true; //!this.rawData.includes('Antonius');
    }
    getTimeAgarre() {
        return 200;
    }
}
