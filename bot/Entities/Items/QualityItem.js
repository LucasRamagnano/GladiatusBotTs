var _a;
var QualityColors;
(function (QualityColors) {
    QualityColors[QualityColors["UNKWNOWN"] = -99] = "UNKWNOWN";
    QualityColors[QualityColors["WHITE"] = -1] = "WHITE";
    QualityColors[QualityColors["GREEN"] = 0] = "GREEN";
    QualityColors[QualityColors["BLUE"] = 1] = "BLUE";
    QualityColors[QualityColors["PURPLE"] = 2] = "PURPLE";
    QualityColors[QualityColors["ORANGE"] = 3] = "ORANGE";
    QualityColors[QualityColors["RED"] = 4] = "RED";
})(QualityColors || (QualityColors = {}));
class QualityItem {
    constructor(code, color, qualityColor) {
        this.tipo_class = 'QualityItem';
        this.code = code;
        this.color = color;
        this.qualityColor = qualityColor;
    }
    fromJsonString(guardado) {
        this.code = guardado.code;
        this.color = guardado.color;
        this.qualityColor = guardado.qualityColor;
        return this;
    }
}
class QualityItemControler {
    static getColorFromRaw(rawData) {
        try {
            let colorPick = this.qualitysItem
                .filter(e => rawData.includes(e.code))
                .map(e => { return { quality: e, index: 0 }; })
                .map(e => {
                e.index = rawData.indexOf(e.quality.code);
                return e;
            })
                .sort((e1, e2) => e1.index > e2.index ? 1 : -1)[0];
            return colorPick.quality;
        }
        catch (e) {
            return new QualityItem('unknown', 'unknown', QualityColors.UNKWNOWN);
        }
    }
    static getWhiteQuality() {
        return new QualityItem('white', 'white', QualityColors.WHITE);
    }
    static getGreenQuality() {
        return new QualityItem('lime', 'green', QualityColors.GREEN);
    }
    static getBlueQuality() {
        return new QualityItem('#5159F7', 'blue', QualityColors.BLUE);
    }
    static getPurpleQuality() {
        return new QualityItem('#E303E0', 'purple', QualityColors.PURPLE);
    }
    static getGoldQuality() {
        return new QualityItem('#FF6A00', 'gold', QualityColors.ORANGE);
    }
    static getRedQuality() {
        return new QualityItem('#FF0000', 'red', QualityColors.RED);
    }
}
_a = QualityItemControler;
QualityItemControler.qualitysItem = [_a.getWhiteQuality(), _a.getGreenQuality(), _a.getBlueQuality(), _a.getPurpleQuality(), _a.getGoldQuality(), _a.getRedQuality()];
