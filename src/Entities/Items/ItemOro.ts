class ItemOro implements Item{
    tipo_class: string = 'ItemOro';
    oroValor: number = 0;
    htmlElement: HTMLElement;

    constructor()
    constructor(oroValor: number)
    constructor(oroValor?: number) {
        this.oroValor = oroValor;
    }

    getTipo(): ItemTypes {
        return ItemTypes.ItemOro;
    }

    fromJsonString(guardado: any): Guardable {
        this.oroValor = guardado.oroValor;
        return this;
    }

    getCalidad(): QualityItem {
        return QualityItemControler.getWhiteQuality();
    }


    setHtmlElement(elem:HTMLElement): void {
        this.htmlElement = elem;
    }

    getHtmlElement(): HTMLElement {
        return this.htmlElement;
    }

    esAgarrable(): boolean {
        return true;
    }

    getTimeAgarre(): number {
        return 1000;
    }
}