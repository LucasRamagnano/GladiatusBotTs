class ItemRecurso implements Item {
    tipo_class: string = 'ItemRecurso';
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
        return ItemTypes.ItemRecurso;
    }

    setHtmlElement(elem: HTMLElement): void {
        this.htmlElement = elem;
    }

    esAgarrable(): boolean {
        return true;
    }

    getTimeAgarre(): number {
        return 200;
    }
}