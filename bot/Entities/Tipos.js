class Guardable {
    fromJsonString(guardado) {
        return null;
    }
    ;
}
class AuctionKey {
    constructor(key) {
        this.contador = 0;
        this.maxLevel = 0;
        this.statItems = [];
        this.key = key;
    }
    encontrado() {
        this.contador++;
    }
    analizarNivel(nuevoLevel) {
        try {
            if (parseInt(nuevoLevel) > this.maxLevel) {
                this.maxLevel = parseInt(nuevoLevel);
            }
        }
        catch (e) {
            //console.log(e);
        }
    }
    getMaxColor() {
        if (this.statItems.some(e => e.getCalidad().color == 'gold')) {
            return 'gold';
        }
        if (this.statItems.some(e => e.getCalidad().color == 'purple')) {
            return 'purple';
        }
        if (this.statItems.some(e => e.getCalidad().color == 'blue')) {
            return 'blue';
        }
        if (this.statItems.some(e => e.getCalidad().color == 'green')) {
            return 'green';
        }
    }
    //let colors:{code:string,color:string,index:number}[] = [{code:'lime',color:'green',index:0}, {code:'#5159F7',color:'blue',index:0}, {code:'#E303E0',color:'purple',index:0}, {code:'#FF6A00',color:'gold',index:0}];
    reset() {
        this.contador = 0;
        this.maxLevel = 0;
        this.statItems = [];
    }
}
class SubastaResultado {
    constructor(busquedas, busquedaFecha, tusSubastas, desc) {
        this.tusSubastas = [];
        this.totalItems = 0;
        this.tipo_class = 'SubastaResultado';
        this.busquedas = busquedas;
        this.busquedaFecha = busquedaFecha;
        this.tusSubastas = tusSubastas;
        this.desc = desc;
    }
    sortResultado(e1, e2) {
        let numberOfWordE1 = Math.min(e1.key.split(' ').length, 2);
        let numberOfWordE2 = Math.min(e2.key.split(' ').length, 2);
        let w1Analyze = e1.key.split(' ').reverse()[0].toLocaleLowerCase();
        let w2Analyze = e2.key.split(' ').reverse()[0].toLocaleLowerCase();
        if (numberOfWordE1 != numberOfWordE2) {
            return numberOfWordE1 > numberOfWordE2 ? 1 : -1;
        }
        else if (e1.contador != 0 && e2.contador != 0) {
            return w1Analyze > w2Analyze ? 1 : -1;
        }
        else if (e1.contador != 0) {
            return -1;
        }
        else if (e2.contador != 0) {
            return 1;
        }
        else {
            return w1Analyze > w2Analyze ? 1 : -1;
        }
    }
    getMostrable(link_subasta, isMercenario) {
        return this.busquedas.sort((e1, e2) => this.sortResultado(e1, e2)).map((e) => {
            let lastWord = e.key.split(' ').pop();
            let a = document.createElement('a');
            a.textContent = e.key + ': ' + e.contador + ' (' + e.maxLevel + ')';
            a.target = '_self';
            e.contador > 0 ? a.classList.add("hay-items") : a.classList.add("vacio");
            a.setAttribute('data-tipo-subasta', this.desc);
            a.classList.add(e.getMaxColor());
            if (!isMercenario)
                a.href = 'https://s36-ar.gladiatus.gameforge.com/game/index.php?mod=auction&qry=' + encodeURIComponent(lastWord) + '&itemLevel=00&itemType=0&itemQuality=-1&sh=' + link_subasta.split('=')[link_subasta.split('=').length - 1];
            else
                a.href = 'https://s36-ar.gladiatus.gameforge.com/game/index.php?mod=auction&qry=' + encodeURIComponent(lastWord) + '&itemLevel=00&itemType=0&itemQuality=-1&ttype=3&sh=' + link_subasta.split('=')[link_subasta.split('=').length - 1];
            return a;
        });
    }
    getTusSubastas() {
        return this.tusSubastas.map((e) => {
            let p = document.createElement('p');
            p.textContent = e;
            return p;
        });
    }
    getMostrableFecha() {
        let p = document.createElement('p');
        console.log('busqueda fecha' + this.busquedaFecha.getMilliseconds());
        let diffMilliseconds = Math.abs(Date.now() - this.busquedaFecha.valueOf());
        console.log('Dif millli ' + diffMilliseconds);
        let diferenciaSegundos = Math.floor((diffMilliseconds / 1000));
        p.textContent = 'Actualizado hace ' + diferenciaSegundos + ' segundos';
        return p;
    }
    fromJsonString(guardado) {
        this.busquedas = guardado.busquedas.map(e => {
            let tempKey = new AuctionKey(e.key);
            tempKey.maxLevel = e.maxLevel;
            tempKey.contador = e.contador;
            tempKey.statItems = e.statItems.map(st => new ItemUsable(st.rawData));
            return tempKey;
        });
        this.busquedaFecha = new Date(guardado.busquedaFecha);
        this.tusSubastas = guardado.tusSubastas;
        this.desc = guardado.desc;
        return this;
    }
}
class Consola {
    static log(mostrar, mensaje) {
        if (mostrar)
            console.log(mensaje);
    }
}
var itemContainerNumber;
(function (itemContainerNumber) {
    itemContainerNumber[itemContainerNumber["CASCO"] = 2] = "CASCO";
    itemContainerNumber[itemContainerNumber["ARMA"] = 3] = "ARMA";
    itemContainerNumber[itemContainerNumber["ARMADURA"] = 5] = "ARMADURA";
    itemContainerNumber[itemContainerNumber["ESCUDO"] = 4] = "ESCUDO";
    itemContainerNumber[itemContainerNumber["GUANTE"] = 9] = "GUANTE";
    itemContainerNumber[itemContainerNumber["ZAPATO"] = 10] = "ZAPATO";
    itemContainerNumber[itemContainerNumber["ANILLO_1"] = 6] = "ANILLO_1";
    itemContainerNumber[itemContainerNumber["ANILLO_2"] = 7] = "ANILLO_2";
    itemContainerNumber[itemContainerNumber["AMULETO"] = 11] = "AMULETO";
})(itemContainerNumber || (itemContainerNumber = {}));
class ItemsPlayers {
    constructor(casco, arma, armadura, escudo, guante, zapato, anillo_1, anillo_2, amuleto) {
        this.casco = new ItemUsable(casco);
        this.arma = new ItemUsable(arma);
        this.armadura = new ItemUsable(armadura);
        this.escudo = new ItemUsable(escudo);
        this.guante = new ItemUsable(guante);
        this.zapato = new ItemUsable(zapato);
        this.anillo_1 = new ItemUsable(anillo_1);
        this.anillo_2 = new ItemUsable(anillo_2);
        this.amuleto = new ItemUsable(amuleto);
    }
}
