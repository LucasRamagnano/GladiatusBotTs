class ItemComida implements Item {
    tipo_class: string = 'ItemComida';
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
        return ItemTypes.ItemComida;
    }

    setHtmlElement(elem: HTMLElement): void {
        this.htmlElement = elem;
    }

}