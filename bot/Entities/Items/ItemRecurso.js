class ItemRecurso {
    constructor() {
        this.tipo_class = 'ItemRecurso';
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
        return ItemTypes.ItemRecurso;
    }
    setHtmlElement(elem) {
        this.htmlElement = elem;
    }
}
