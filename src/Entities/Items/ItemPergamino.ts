class ItemPergamino implements Item {
    tipo_class: string = 'ItemPergamino';
    private htmlElement;

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
        return ItemTypes.ItemPergamino;
    }

    setHtmlElement(elem: HTMLElement): void {
        this.htmlElement = elem;
    }

}