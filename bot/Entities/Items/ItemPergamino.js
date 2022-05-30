class ItemPergamino {
    constructor() {
        this.tipo_class = 'ItemPergamino';
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
        return ItemTypes.ItemPergamino;
    }
    setHtmlElement(elem) {
        this.htmlElement = elem;
    }
    esAgarrable() {
        return true;
    }
    getTimeAgarre() {
        return 200;
    }
    getName() {
        return this.tipo_class;
    }
}
