class LuchaMazmorra implements Tarea {
    prioridad : tareaPrioridad = globalConfig.prioridades.calabozo;
    dificultad : string;
    hacerBoss: boolean;
    indiceLugar : number;
    estado: tareaEstado;
    tipo_class: string = 'LuchaMazmorra';
    
    constructor();
    constructor(dificultad : string, hacerBoss : boolean, indiceLugar : number);
    constructor(dificultad? : string, hacerBoss? : boolean, indiceLugar? : number){
        this.dificultad = dificultad;
        this.hacerBoss = hacerBoss;
        this.indiceLugar = indiceLugar;
    }
    
    noEstaIniciada(): boolean {
        return $('input[value*=\"' + this.dificultad + '\"]').length == 1;
    }

    iniciar(): HTMLElement {
        return $('input[value*=\"' + this.dificultad + '\"]')[0];
    }

    proximoEsBoss(): boolean {
        return $('.map_label').html() === 'Jefe';
    }

    cancelarMazmorra(): HTMLElement {
        return $('input[name*="dungeonId"] + input')[0];
    }

    hayEnemigo(): boolean {
        return $('img[usemap*="#dmap"] + img').length > 0;
    }

    atacar(): HTMLElement {
        return $('img[usemap*="#dmap"] + img')[0];
    }

    estamosEnTuLugar(): boolean {
        return $('#submenu2 a.menuitem')[this.indiceLugar].classList.contains('active');
    }

    irATuLugar(): HTMLElement {
        //$('#cooldown_bar_dungeon .cooldown_bar_link')[0].click();
        return $('#submenu2 a.menuitem')[this.indiceLugar];
    }

    estamosEnDungeon(): boolean {
        return $('#dungeonPage').length == 1;
    }

    irADungeon(): HTMLElement {
        return $('td a.awesome-tabs')[1];
    }

    getProximoClick(): Promise<HTMLElement> {
        if(!this.estamosEnTuLugar()) {
            return Promise.resolve(this.irATuLugar());
        } else if(!this.estamosEnDungeon()) {
            return Promise.resolve(this.irADungeon());
        }else if(this.noEstaIniciada()) {
            return Promise.resolve(this.iniciar());
        } else if(!this.hacerBoss && this.proximoEsBoss()) {
            return Promise.resolve(this.cancelarMazmorra());
        } else if(!this.hayEnemigo()) {
            return Promise.resolve(this.irATuLugar());
        } else {
            this.estado = tareaEstado.finalizada;
            return Promise.resolve(this.atacar());
        }
    }

    fromJsonString(jsonGuardado: any) {
        this.dificultad  = jsonGuardado.dificultad;
        this.indiceLugar  = jsonGuardado.indiceLugar;
        this.hacerBoss  = jsonGuardado.hacerBoss;
        this.estado  = jsonGuardado.estado;
        return this;
    }

    seCancela(): boolean {
        return !globalConfig.modulos.correrMazmorra;
    }

    equals(t: Tarea): boolean {
        return this.tipo_class == t.tipo_class;
    }

    getHomeClick(): HTMLElement {
        return $('#submenu2 a.menuitem')[this.indiceLugar];
    }
}