class ItemBuilder {
    static createItemFromPackageItem(paquetes) {
        let items = [];
        for (const item of paquetes) {
            let creado = this.createFromTooltip($(item).find('.ui-draggable')[0]);
            if (creado != null) {
                creado.setHtmlElement(item);
                items.push(creado);
            }
        }
        return items;
    }
    static createFromTooltip(draggable) {
        if (draggable == undefined || !draggable.hasAttribute('data-tooltip')) {
            return null;
        }
        let tooltip = draggable.getAttribute('data-tooltip');
        let nombreItem = tooltip.split('"')[1];
        if (new RegExp(/(\w)* Oro\&quot/).test(tooltip) || new RegExp(/(\w)* Oro"/).test(tooltip)) {
            return new ItemOro(Number.parseInt($(draggable).attr('data-price-gold')));
        }
        else if (getItemCategoria(nombreItem).subCategoria != 'Unknown' && getItemCategoria(nombreItem).subCategoria != 'Recursos') {
            return new ItemUsable(tooltip);
        }
        else if (getItemCategoria(nombreItem).subCategoria == 'Recursos' && tooltip.split('],[').length == 2) {
            return new ItemRecurso();
        }
        else if (new RegExp(/ndose: Cura (\w)* de vida/).test(tooltip)) {
            return new ItemComida(tooltip);
        }
        else if (new RegExp(/Pergaminos/).test(tooltip)) {
            return new ItemPergamino();
        }
        else {
            return new ItemUnknown(tooltip);
        }
    }
}
