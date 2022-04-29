class ItemUnknown implements Item{
    tipo_class: string = 'ItemUnknown';
    htmlElement: HTMLElement;
    rawData: string;

    constructor(rawData: string) {
        this.rawData = rawData;
    }

    fromJsonString(guardado: any): Guardable {
        return this;
    }

    getCalidad(): QualityItem {
        return QualityItemControler.getWhiteQuality();
    }

    getTipo(): ItemTypes {
        return ItemTypes.ItemUnknown;
    }

    setHtmlElement(elem:HTMLElement): void {
        this.htmlElement = elem;
    }

    getHtmlElement(): HTMLElement {
        return this.htmlElement;
    }

    esAgarrable(): boolean {
        return !this.rawData.includes('Antonius');
    }

    getTimeAgarre(): number {
        return 200;
    }


}