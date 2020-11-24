class ArenaPlayer {
    linkPlayer: string;
    indice: number;
    nombre: string;
    nivel: number;
    fuerza: number;
    habilidad: number;
    agilidad: number;
    constitucion: number;
    carisma: number;
    inteligencia: number;
    armadura: number;
    danioMin: number;
    danioMax: number;
    danioPromedio: number;
    danioArmaduraEquiv: number;
    porcentajeCritico: number;
    porcentajeBloqueo: number;
    puntaje: number;
    toClick: HTMLElement;

    constructor(linkPlayer: string, toClick: HTMLElement, indice: number) {
        this.linkPlayer = linkPlayer;
        this.toClick = toClick;
        this.indice = indice;
    }

    async loadData() {
        let response = await fetch(this.linkPlayer);
        let paginaPlayer = await response.text();
        if($(paginaPlayer).find('.playername_achievement').length > 0)
            this.nombre = $(paginaPlayer).find('.playername_achievement')[0].textContent.trim();
        else
            this.nombre = $(paginaPlayer).find('.playername')[0].textContent.trim();
        this.nivel = Number.parseInt($(paginaPlayer).find('#char_level')[0].textContent);
        this.fuerza = Number.parseInt($(paginaPlayer).find('#char_f0')[0].textContent);
        this.habilidad = Number.parseInt($(paginaPlayer).find('#char_f1')[0].textContent);
        this.agilidad = Number.parseInt($(paginaPlayer).find('#char_f2')[0].textContent);
        this.constitucion = Number.parseInt($(paginaPlayer).find('#char_f3')[0].textContent);
        this.carisma = Number.parseInt($(paginaPlayer).find('#char_f4')[0].textContent);
        this.inteligencia = Number.parseInt($(paginaPlayer).find('#char_f5')[0].textContent);
        this.armadura = Number.parseInt($(paginaPlayer).find('#char_panzer')[0].textContent);
        this.danioMin = Number.parseInt($(paginaPlayer).find('#char_schaden')[0].textContent.split(" ")[0]);
        this.danioMax = Number.parseInt($(paginaPlayer).find('#char_schaden')[0].textContent.split(" ")[2]);
        this.danioPromedio = (this.danioMin + this.danioMax) / 2;
        //Critico
        let posicionStart = $(paginaPlayer).find('#char_schaden_tt').attr('data-tooltip').indexOf('Posibilidad de da\\u00f1o critico:');
        posicionStart = posicionStart + 36;
        let posicionFinal = posicionStart + 2;
        this.porcentajeCritico = Number.parseInt($(paginaPlayer).find('#char_schaden_tt').attr('data-tooltip').substring(posicionStart,posicionFinal));
        //Bloqueo
        posicionStart = $(paginaPlayer).find('#char_panzer_tt').attr('data-tooltip').indexOf('Oportunidad de bloquear un golpe:');
        posicionStart = posicionStart + 36;
        posicionFinal = posicionStart + 2;
        this.porcentajeBloqueo = Number.parseInt($(paginaPlayer).find('#char_panzer_tt').attr('data-tooltip').substring(posicionStart,posicionFinal));
        this.danioArmaduraEquiv = (this.armadura)*0.01627-20
    }
}