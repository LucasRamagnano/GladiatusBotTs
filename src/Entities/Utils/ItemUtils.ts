class ItemUtils {

    static async moverItem(item: Item, destino: HTMLElement) {
        let spot = {
            parent : $(destino),
            x : ($(destino).offset().left + ($(destino).width() / 2)),
            y : ($(destino).offset().top + ($(destino).height() / 2))
        }
        let intentosMover = 0;
        console.log(item);
        try {
            while (intentosMover <= 5 && !$(destino)[0].innerHTML.includes(item.getName())) {
                console.log('Moviendo item: ' + item.getName());
                ItemUtils.drag(item.getHtmlElement(), spot.parent, spot.x, spot.y);
                let intentosEsperaDisabled = 0;
                await GenericUtils.wait(20000);
                while(intentosEsperaDisabled <= 5 && $(destino).find('.disabled').length > 0) {
                    await GenericUtils.wait(1000 + (1000 * intentosEsperaDisabled));

                    intentosEsperaDisabled++;
                }
                intentosMover++;
            }
        } finally {
            console.log($(destino)[0].innerHTML.toLowerCase());
            console.log(item.getName().toLowerCase());
            console.log(!$(destino)[0].innerHTML.toLowerCase().includes(item.getName().toLowerCase()));
            if(!$(destino)[0].innerHTML.toLowerCase().includes(item.getName().toLowerCase())){
                throw 'Error al mover el item ' + item.getName();
            }
        }
    }

    private static drag(item:HTMLElement, parent, x, y){
        let cords_item = $(item).offset();
        let cords_item_xy = {x: cords_item.left, y: cords_item.top};
        let cords_target = {x: x, y: y};
        ItemUtils.fireMouseEvent(item, 'mousedown', {clientX: cords_item_xy.x - window.scrollX, clientY: cords_item_xy.y - window.scrollY});
        ItemUtils.fireMouseEvent(document, 'mousemove', {clientX: cords_target.x - window.scrollX, clientY: cords_target.y - window.scrollY});
        ItemUtils.fireMouseEvent(document, 'mouseup', {clientX: cords_target.x - window.scrollX, clientY: cords_target.y - window.scrollY});
    }

    private static fireMouseEvent(elem, type, opt) {
        let options = {
            bubbles: true,
            cancelable: (type !== 'mousemove'),
            view: window,
            detail: 0,
            screenX: 0,
            screenY: 0,
            clientX: 1,
            clientY: 1,
            ctrlKey: false,
            altKey: false,
            shiftKey: false,
            metaKey: false,
            button: 0,
            relatedTarget: undefined
        };
        options.clientX = opt.clientX;
        options.clientY = opt.clientY;
        let event = document.createEvent('MouseEvents');
        event.initMouseEvent( type, options.bubbles, options.cancelable,
            options.view, options.detail,
            options.screenX, options.screenY, options.clientX, options.clientY,
            options.ctrlKey, options.altKey, options.shiftKey, options.metaKey,
            options.button, options.relatedTarget || document.body.parentNode );
        elem.dispatchEvent(event);
    }

    static async ponerHojaNumero(hoja:number,inventoryBox: JQuery<HTMLElement>) {
        let intentosCambioHoja = 0;
        let inventario = $(inventoryBox).find('#inventory_nav a.awesome-tabs[data-available*=\"true\"]');
        while (inventario.length >= hoja + 1 && !inventario[hoja].classList.contains('current') && intentosCambioHoja <= 5) {
            console.log('Poniendo hoja numero: ' + hoja);
            inventario[hoja].click();
            //each try, wait a little more
            await GenericUtils.wait(1000 + (1000 * intentosCambioHoja));
            intentosCambioHoja++;
        }

        if (!inventario[hoja].classList.contains('current') && intentosCambioHoja > 5) {
            console.log('Error al cambiar de hoja!');
            throw 'Error al poner hoja numero ' + hoja
        }
    }
}