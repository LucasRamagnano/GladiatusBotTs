enum QualityColors{
    UNKWNOWN = -99, WHITE = -1, GREEN = 0, BLUE = 1, PURPLE = 2, ORANGE = 3, RED = 4
}

class QualityItem implements Guardable{
    code: string;
    color: string;
    qualityColor: QualityColors;
    tipo_class: string = 'QualityItem';

    constructor(code: string, color: string, qualityColor: QualityColors) {
        this.code = code;
        this.color = color;
        this.qualityColor = qualityColor;
    }

    fromJsonString(guardado: any): Guardable {
        this.code = guardado.code;
        this.color = guardado.color;
        this.qualityColor = guardado.qualityColor;
        return this;
    }

}

class QualityItemControler {
    private static qualitysItem = [this.getWhiteQuality(), this.getGreenQuality(), this.getBlueQuality(), this.getPurpleQuality(), this.getGoldQuality(), this.getRedQuality()];

    static getColorFromRaw(rawData: string) : QualityItem {
        try {
            let colorPick = this.qualitysItem
                .filter(e => rawData.includes(e.code))
                .map(e =>  {return {quality:e,index:0}})
                .map(e => {
                    e.index = rawData.indexOf(e.quality.code);
                    return e;
                })
                .sort((e1, e2) => e1.index > e2.index ? 1 : -1)[0];
            return colorPick.quality;
        }catch (e){
            return new QualityItem('unknown','unknown',QualityColors.UNKWNOWN);
        }
    }

    static getWhiteQuality() {
        return new QualityItem('white','white',QualityColors.WHITE);
    }

    static getGreenQuality() {
        return new QualityItem('lime','green',QualityColors.GREEN);
    }

    static getBlueQuality() {
        return new QualityItem('#5159F7','blue',QualityColors.BLUE);
    }

    static getPurpleQuality() {
        return new QualityItem('#E303E0','purple',QualityColors.PURPLE);
    }

    static getGoldQuality() {
        return new QualityItem('#FF6A00','gold',QualityColors.ORANGE);
    }

    static getRedQuality() {
        return new QualityItem('#FF0000','red',QualityColors.RED);
    }
}