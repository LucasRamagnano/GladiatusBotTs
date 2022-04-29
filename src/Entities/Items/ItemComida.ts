class ItemComida implements Item {
    tipo_class: string = 'ItemComida';
    rawData: string;
    private htmlElement;

    constructor(rawData: string) {
        this.rawData = rawData;
    }

    fromJsonString(guardado: any): Guardable {
        return this;
    }

    getCalidad(): QualityItem {
        return QualityItemControler.getWhiteQuality();
    }

    getHtmlElement(): HTMLElement {
        return this.htmlElement;
    }

    getTipo(): ItemTypes {
        return ItemTypes.ItemComida;
    }

    setHtmlElement(elem: HTMLElement): void {
        this.htmlElement = elem;
    }

    esAgarrable(): boolean {
        return !this.rawData.includes('dose: Centuri');
    }

    getTimeAgarre(): number {
        return 300;
    }
}