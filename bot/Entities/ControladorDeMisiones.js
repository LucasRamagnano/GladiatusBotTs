class ControladorDeMisiones {
    constructor() {
        this.prioridad = globalConfig.prioridades.misiones;
        this.tipo_class = 'ControladorDeMisiones';
        this.timed_out_miliseconds = 5000;
    }
    cargarMisiones(tipo, id) {
        let misionesTemp = [];
        $(id + ' .contentboard_slot.contentboard_slot_inactive').each(function () {
            let xp = isNaN(parseInt($(this).find('.quest_slot_reward_xp').text().replace('.', ''))) ? 0 : parseInt($(this).find('.quest_slot_reward_xp').text().replace('.', ''));
            let oro = parseInt($(this).find('.quest_slot_reward_gold').text().replace('.', ''));
            let honor = parseInt($(this).find('.quest_slot_reward_honor').text().replace('.', ''));
            let esPorTiempo = $(this).find('.quest_slot_time').length !== 0;
            let tieneItem = $(this).find('.quest_slot_reward_item img').length !== 0;
            let esSeguida = $(this).find('.quest_slot_title:contains(\'seguidos\')').length + $(this).find('.quest_slot_title:contains(\'consecutivos\')').length > 0;
            let text = $(this).find('.quest_slot_title').text();
            let link = $(this).find('.quest_slot_button_accept')[0];
            misionesTemp.push(new Mision(oro, honor, xp, esPorTiempo, tieneItem, esSeguida, tipo, text, link, this));
            //Mision(oro,honor,exp,esPorTiempo, tieneItem, seguidos, tipoM, textM, link)
        });
        return misionesTemp;
    }
    calcularMisiones() {
        let misiones = [];
        misiones = misiones.concat(this.cargarMisiones(tipoMisiones.ARENA, '#qcategory_arena'));
        misiones = misiones.concat(this.cargarMisiones(tipoMisiones.TURMA, '#qcategory_grouparena'));
        misiones = misiones.concat(this.cargarMisiones(tipoMisiones.COMBATE, '#qcategory_combat'));
        misiones = misiones.concat(this.cargarMisiones(tipoMisiones.EXPEDICION, '#qcategory_expedition'));
        misiones = misiones.concat(this.cargarMisiones(tipoMisiones.MAZMORRA, '#qcategory_dungeon'));
        misiones = misiones.concat(this.cargarMisiones(tipoMisiones.TRABAJO, '#qcategory_work'));
        misiones = misiones.concat(this.cargarMisiones(tipoMisiones.ITEM, '#qcategory_items'));
        return misiones;
    }
    buscarMisionToAccept() {
        let misiones = this.calcularMisiones();
        return misiones.filter(e => e.esPosible()).sort((a, b) => -1 * (a.calcularPuntaje() - b.calcularPuntaje()));
    }
    misionesEnCoolDown() {
        return $('#quest_header_cooldown').length === 1;
    }
    estamosEnQuest() {
        return $('#questsPage').length === 1;
    }
    irAQuest() {
        return $('a[title=\'Panteón\']')[0];
    }
    restartMision() {
        return $('.quest_slot_button_restart')[0];
    }
    hayMisionesAReiniciar() {
        return $('.quest_slot_button_restart').length !== 0;
    }
    hayMisionesParaIniciar() {
        return $('.contentboard_slot.contentboard_slot_inactive .quest_slot_button_accept').length !== 0;
    }
    hayMisionesAFinalizar() {
        return $('.quest_slot_button_finish').length !== 0;
    }
    finalizarMision() {
        return $('.quest_slot_button_finish')[0];
    }
    nuevasMisiones() {
        return $('input[value=\'Misiones nuevas\']')[0];
    }
    getProximoClick() {
        if (!this.estamosEnQuest()) {
            return Promise.resolve(this.irAQuest());
        }
        else if (this.hayMisionesAReiniciar()) {
            return Promise.resolve(this.restartMision());
        }
        else if (this.hayMisionesAFinalizar()) {
            return Promise.resolve(this.finalizarMision());
        }
        else if (this.hayMisionesParaIniciar()) {
            let misionesOrdenadas = this.buscarMisionToAccept();
            if (misionesOrdenadas.length !== 0)
                return Promise.resolve(misionesOrdenadas[0].aceptarButton());
            else
                return Promise.resolve(this.nuevasMisiones());
        }
        else {
            this.estado = tareaEstado.toTheEnd;
            return Promise.resolve(this.irAQuest());
        }
    }
    fromJsonString(jsonGuardado) {
        this.estado = jsonGuardado.estado;
        this.tipo_class = jsonGuardado.tipo_class;
        return this;
    }
    seCancela() {
        return !globalConfig.modulos.correrMisiones;
    }
    equals(t) {
        return t.tipo_class == this.tipo_class;
    }
    getHomeClick() {
        return $('a[title=\'Panteón\']')[0];
    }
    puedeDesbloquearse() {
        return true;
    }
}
