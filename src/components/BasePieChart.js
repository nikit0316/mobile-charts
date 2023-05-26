import config from '../model/Config';
import {YearsModel} from '../model/Model';
import { PieChart } from "react-native-chart-kit";
import {Dimensions, View} from "react-native";
import ModelComponent from './ModelComponent';

const defaultColors = [
    '#7A9DFB',
    '#503795',
    '#4D9C8D'
];

class BasePieChart extends ModelComponent {
    constructor(p) {
        super(p);

        this.refPie = this.refPie.bind(this)
        this.colors = this.props.colors || [];
        defaultColors.forEach(x => (this.colors.indexOf(x) < 0) && this.colors.push(x));
    }

    createModel() {
        var model = YearsModel.getByTypeId(this.props.typeId, {
            name: this.props.modelName || ('pie_' + this.props.typeId),
            valueField: this.props.field,
            filter: this.props.filter,
            groupFieldVar: 'ag',
            hierarchy: [this.props.category]
        });

        this.modelName = model.getName();
        return model;
    }

    refPie(el) {
        if (!el) {
            return;
        }

        this.pieEL = window.AmCharts.makeChart(el, {
            "type": "pie",
            "innerRadius": "70%",
            "startDuration": 0,
            pullOutRadius: '0%',
            "colors": this.colors,
            "balloonText": "",
            "labelText": "",
            "titleField": "title",
            "valueField": "value",
            "thousandsSeparator": ' ',
            language: 'ru',
            "export": {
                "enabled": true,
                "menuReviver": function (item, li) {
                    if (item.format == "XLSX") {
                        item.name = "My sheet";
                    }
                    return li;
                }
            },
            "dataProvider": this.props.fields.map(x => {
                return {value: this.getData(x), title: x.text}
            })
        });
    }

    getData(x) {
        var cfg = config[this.props.typeId];
        return this.model.calc(x.name, this.props.aggregate || (cfg && cfg.aggregate) || 'sum', x.filter);
    }

    getPieChartData() {
        const data = this.props.fields.map((x, i) => {
            return {value: this.getData(x), name: x.text, color: defaultColors[i], legendFontColor: '#7F7F7F', legendFontSize: 15
            }
        })
        return data
    }



    render() {
        const data = this.getPieChartData()
        return <View>
            <PieChart
                data={data}
                width={Dimensions.get("window").width}
                height={220}
                chartConfig={{
                    backgroundColor: "#e26a00",
                    backgroundGradientFrom: "#fb8c00",
                    backgroundGradientTo: "#ffa726",
                    decimalPlaces: 2, // optional, defaults to 2dp
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    style: {
                        borderRadius: 16
                    },
                    propsForDots: {
                        r: "6",
                        strokeWidth: "2",
                        stroke: "#ffa726"
                    }
                }}
                accessor={"value"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                center={[0, 5]}
                absolute/>
        </View>
    }
}

export default BasePieChart;
