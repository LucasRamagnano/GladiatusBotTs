function filtrar(evento){
    let valoresAMostrar = [];
    $('.filtro_cb:checkbox:checked').toArray().forEach(e=>{
        valoresAMostrar = valoresAMostrar.concat(nombreData[(<HTMLInputElement>e).value]);
    });

    let clasesColores = $('.filtro_color_cb:checkbox:checked').toArray()
    .map(e=>'.'+(<HTMLInputElement>e).value+' ')
    .join();

    let nivelMinimo = Number.parseInt(toInputArray($('#nivelpick'))[0].value);

    let tdMostrar = $('#auction_table td').toArray();
    $('#auction_table tr').css('display','none');
    //filtro niveles
    tdMostrar = tdMostrar.filter(elem=>{
        if($(elem).find('form')[0]===undefined)
            return false;
        return Number.parseInt($(elem).find('form')[0].getAttribute('data-nivel')) >= nivelMinimo;
    })
    //filtro palabras
    let palabras = (<HTMLInputElement[]><unknown>$('#palabras'))[0].value.trim().split(',');
    tdMostrar = tdMostrar.filter(elem=>{
        if($(elem).find('.auction_item_div .ui-draggable')[0] !== undefined) {
            let desc = $(elem).find('.auction_item_div .ui-draggable')[0].getAttribute('data-tooltip');
            desc = desc.substring(0,desc.indexOf('icon_gold'));
            desc = desc.normalize("NFD").replace(/[\u0300-\u036f]/g, "");//saco tildes y otros
            return palabras.some(valor => desc.toLocaleLowerCase().includes(valor.toLocaleLowerCase()));
        }
        return false;
    })
    //filtro colores
    tdMostrar = tdMostrar.filter(elem=>{
                    return $(elem).find(clasesColores).length != 0;
                })
    //filtro de tipo de elementos
    tdMostrar = tdMostrar.filter(elem=>{
                    if($(elem).find('.auction_item_div .ui-draggable')[0] !== undefined) {
                        let desc = $(elem).find('.auction_item_div .ui-draggable')[0].getAttribute('data-tooltip');
                        return valoresAMostrar.some(valor => desc.includes(valor) && !desc.includes('Habilidad: '));
                    }
                    return false;
                })
    if(/*agrupar*/true)
        tdMostrar = tdMostrar.sort(compareTipo)
    let bodyTable = $('#auction_table tbody')[0];
    poblarTablaSubasta(tdMostrar,bodyTable);
    $('#resultados')[0].innerText = tdMostrar.length + ' resultados.'
}

function inicializarFiltros() {
    toInputArray($('#nivelpick'))[0].value = toInputArray($('select[name="itemLevel"]'))[0].value;
    $('#fs_body #izquierda input[type="checkbox"]').attr("checked", "checked");
    $('#fs_body').draggable({ containment: "parent" });
    $('#filtrar')[0].addEventListener('click',filtrar);
    $('#todo')[0].addEventListener('click',()=>{
        $('#fs_body #izquierda input[type="checkbox"]').attr("checked", "checked");
    });

    $('#nada')[0].addEventListener('click',()=>{
        $('#fs_body #izquierda input[type="checkbox"]').attr("checked", 'false');
        (<HTMLInputElement><unknown>$('#palabras'))[0].value = '';
        toInputArray($('#nivelpick'))[0].value = toInputArray($('select[name="itemLevel"]'))[0].value;
    });
}

function poblarTablaSubasta(tds, body) {
    let cantidadTds = tds.length - 1;
    let contador = 0;

    while(contador <= cantidadTds) {
        //creo tr
        let trNode = document.createElement("TR");
        body.appendChild(trNode);
        trNode.appendChild(tds[contador])
        if(contador+1 <= cantidadTds) {
            trNode.appendChild(tds[contador+1])
        }else {
            let tdNodeVacio = document.createElement("TD");
            trNode.appendChild(tdNodeVacio);
        }
        contador = contador+2;
    }
}

function compareTipo(tda,tdb) {
        if (getTipoNumber(tda)> getTipoNumber(tdb)) {
          return 1;
        }
        if (getTipoNumber(tda)< getTipoNumber(tdb)) {
          return -1;
        }
        return 0;
}

function getTipoNumber(td) {
    let desc = $(td).find('.auction_item_div .ui-draggable')[0].getAttribute('data-tooltip');
    desc = desc.substring(0,desc.indexOf('icon_gold'));
    if(nombreData.armas.some(elem=>desc.includes(elem))) {
        return 1;
    }
    if(nombreData.escudos.some(elem=>desc.includes(elem))) {
        return 3;
    }
    if(nombreData.armaduras.some(elem=>desc.includes(elem))) {
        return 4;
    }
    if(nombreData.cascos.some(elem=>desc.includes(elem))) {
        return 5;
    }
    if(nombreData.guantes.some(elem=>desc.includes(elem))) {
        return 6;
    }
    if(nombreData.zapatos.some(elem=>desc.includes(elem))) {
        return 7;
    }
    if(nombreData.anillos.some(elem=>desc.includes(elem))) {
        return 8;
    }
    if(nombreData.amuletos.some(elem=>desc.includes(elem))) {
        return 9;
    }
    if(nombreData.mercenarios.some(elem=>desc.includes(elem))) {
        return 10;
    }
    return 0;
}

//----------DATA INIT
let nombreData = {
armas : ['Garrote','Espada corta','Daga corta','Hoz de batalla',
                'Espada grande','Roce intensivo','Tridente','Espada larga',
                'Hacha','Lanza tridente','Hacha grande','Martillo',
                'Daga punteaguda','Angel de la muerte','Schiavone','Gladius',
                'Khopesh','Lanza','Seax','Vara de lucha'],

escudos : ['Tablones','Escudo de madera','Escudo redondo','Red','Escudo del dragón',
                 'Escudo de plata','Escudo de la torre','Escudo de fuego','Escudo de la torre en llamas',
                 'Escudo de titanio','Escudo vikingo','Escudo egipcio'],

armaduras : ['Trapos','Armadura de cuero','Cuero Doble','Hombreras de cobre','Media de chapa',
                   'Chapa de cobre','Armadura Catenarian','Chapa de hierro','Placa entera','Hombreras de hierro',
                   'Armadura dura de cuero','Armadura de cocodrilo'],

cascos : ['Casco de cuero','Gorra de hierro','Myrmillo','Thracian','Casco de gladiador','Casco de cráneo',
                'Casco vikingo','Centurión','Casco de Centurión entero','Centurión de latón','Casco de cobre',
                'Casco de púas','Casco con visor'],

guantes : ['Guantes de cuero','Muñequeras de cobre','Guantes de cobre','Guantes de batalla de cuero',
                 'Muñequeras de cuero','Brazaletes de hierro','Guantes con remaches','Muñequeras de chapa',
                 'Brazaletes de chapa'],

anillos : ['Anillo azul','Anillo de malaquita','Anillo de oro','Anillo de plata',
                 'Anillo del dragón','Anillo de rubies','Escarabajo','Trisquel'],

zapatos : ['Sandalias','Sandalias de cuero','Botas de cuero','Botas de batalla de cuero',
                'Vendas de cobre','Botas de caza','Vendajes de cuero duro','Botas de batalla de plata',
                'Botas remachadas','Botas de placas'],

amuletos : ['Pendiente de Oro','Collar de plata','Pendiente de cornalina','Reliquia de plata',
                'Pendiente Sugilith','Pendiente de malaquita','Talismán de estrella',
                'Pendiente de rubies','Ojo de Ra','Fíbula'],

mercenarios : ['Habilidad: ']
}

/*
$('#auction_table td').toArray().forEach(elem=>{
    $(elem).find('.auction_item_div .ui-draggable')[0])
})*/

/*
posibles = '';
$('#basic0 > optgroup:nth-child(7) option').toArray().forEach((elem)=>
{
 posibles += '\'' + elem.innerText.substring(elem.innerText.indexOf(')')+2,100) + '\'\,'
})
posibles
*/