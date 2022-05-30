class ItemComida {
    constructor(rawData) {
        this.tipo_class = 'ItemComida';
        this.rawData = rawData;
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
    esAgarrable() {
        return !this.rawData.includes('dose: Centuri');
    }
    getTimeAgarre() {
        return 300;
    }
    getName() {
        return this.tipo_class;
    }
}
