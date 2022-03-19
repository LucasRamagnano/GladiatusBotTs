class ItemBuilder {
    static createItemFromPackageItem(paquetes: HTMLElement[]): Item[] {
        let items = [];
        for (const item of paquetes) {
            let creado = this.createFromTooltip($(item).find('.ui-draggable')[0]);
            if(creado != null) {
                creado.setHtmlElement(item);
                items.push(creado);
            }
        }
        return items;
    }

    private static createFromTooltip(draggable: HTMLElement) : Item {
        if(draggable == undefined || !draggable.hasAttribute('data-tooltip')) {
            return null;
        }
        let tooltip = draggable.getAttribute('data-tooltip');
        let nombreItem = tooltip.split('"')[1];
        if(new RegExp(/(\w)* Oro\&quot/).test(tooltip) || new RegExp(/(\w)* Oro"/).test(tooltip)) {
            return new ItemOro(Number.parseInt($(draggable).attr('data-price-gold')));
        }else if(getItemCategoria(nombreItem).subCategoria != 'Unknown' && getItemCategoria(nombreItem).subCategoria != 'Recursos') {
            return new ItemUsable(tooltip);
        }else if(getItemCategoria(nombreItem).subCategoria == 'Recursos' && tooltip.split('],[').length == 2) {
            return new ItemRecurso();
        }else if(new RegExp(/ndose: Cura (\w)* de vida/).test(tooltip)) {
            return new ItemComida();
        }else if(new RegExp(/Pergaminos/).test(tooltip)) {
            return new ItemPergamino();
        }else {
            return new ItemUnknown();
        }
    }
}