import {StackedBarChart} from "react-native-chart-kit";
import {View, Dimensions} from "react-native";
import ModelComponent from "./ModelComponent";
import Model from "../model/Model";

const defaultColors = [
    '#FFF',
    '#000000',
    '#0330db'
]


const cats = ['day', 'day', 'month'],
    catsValue = ['day', 'date_day', 'date_mounth'];
class BaseLineChart extends ModelComponent {
    constructor(p) {
        super(p);
        this.refChart = this.refChart.bind(this);
    }

    getCategoryField() {
        return this.state.categoryField || cats[Model.getVariable()];
    }

    getCategoryFieldValue() {
        return this.state.categoryField || catsValue[Model.getVariable()];
    }

    showLegend() {
        return (this.state.legend === undefined) || !!this.state.legend;
    }

    getData(data) {
        if (!data) {
            data = this.props.data || this.model.data
        }

        var cf = this.getCategoryFieldValue(),
            cft = this.getCategoryField(),
            sf = this.props.sortField || cf,
            sd = (this.props.sortDirection || 1) ? 1 : -1;

        if (this.props.sortpm) {
            data = data.sort((a, b) => b._pm - a._pm);
        }
        data = data.reduce((a, b) => {
            var o = a.find(x => x[cf] === b[cf]);
            if (!o) {
                o = {};
                o[cf] = b[cf];
                o[cft] = b[cft];
                o[sf] = b[sf];
                a.push(o);
            }

            this.props.graphs
                .forEach(g => (!g.filter || g.filter(b)) && b[g.name || g.valueField] && (o[g.valueField] = ((o[g.valueField] || 0) + b[g.name || g.valueField])));

            return a;
        }, []);

        if (this.props.sort !== false) {
            data = data.sort((a, b) => a[sf] > b[sf] ? sd : -sd);
        }
        return data;
    }

    buildValueAxes() {
        return (this.state.valueAxes || [{}]).map((x, i) => {
            var res = Object.assign({
                "id": "ValueAxis-" + i,
                unit: this.state.unit,
                axisAlpha: 0,
                axisColor: "var(--muted-color)",
                color: 'var(--muted-color)'
            }, x);

            if (res.unit === '%') {
                res = Object.assign({
                    "maximum": 100,
                    "minimum": 0,
                    minVerticalGap: 1
                }, res);
            }

            return res;
        });
    }

    buildLegend(el) {
        if (!this.showLegend()) {
            return null;
        }

        var legend = {
            "enabled": true,
            "fontSize": 16,
            "autoMargins": false,
            "marginBottom": 10,
            "switchable": this.props.switchable,
            "valueText": '',
            labelWidth: el.offsetWidth - 100
        };

        if (!this.state.graphs.find(x => x.type == 'column')) {
            Object.assign(legend, {
                "markerType": "bubble",
                "markerAlpha": 1,
                "markerBorderAlpha": 1,
                "markerBorderThickness": 3,
                "markerColor": "#fff",
                "markerSize": 8
            });
        }

        return Object.assign(legend, this.state.legend);
    }

    getGraphData() {
        let colors = (this.state.colors || []).concat(defaultColors),
            graphData = this.getData(),
            modelCfg = this.model.getConfig(),
            graphs = this.state.graphs.filter(x => !x.valueField || graphData.find(d => d[x.valueField])).map((x, i) => {
                var fill = colors[i];
                if (fill) {
                    var cindx = fill.indexOf('-color)')
                    if (cindx >= 0 && fill.indexOf('-light-color)') < 0) {
                        //fill = fill.substring(0, cindx) + '-light-color)';
                    }

                    if (this.state.gradient !== false) {
                        fill = [fill, 'transparent'];
                    }

                    x = Object.assign({
                        "valueField": "val" + i
                    }, x)
                }
                return x;
            });
        let valueFields = graphs.map(x => x.valueField);
        graphData.forEach(x => valueFields.forEach(vf => {
            if (!x[vf]) {
                x[vf] = 0;
            }
        }))
        return [graphData, valueFields];
    }
    refChart(el) {
        if (!el) {
            return;
        }

       let colors = (this.state.colors || []).concat(defaultColors),
            data = this.getData(),
            modelCfg = this.model.getConfig(),
            graphs = this.state.graphs.filter(x => !x.valueField || data.find(d => d[x.valueField])).map((x, i) => {
                var fill = colors[i];
                if (fill) {
                    var cindx = fill.indexOf('-color)')
                    if (cindx >= 0 && fill.indexOf('-light-color)') < 0) {
                        //fill = fill.substring(0, cindx) + '-light-color)';
                    }

                    if (this.state.gradient !== false) {
                        fill = [fill, 'transparent'];
                    }
                }

                x = Object.assign({
                    "balloonText": (x.title ? '[[title]]: ' : '[[category]] : ') + '[[value]]',
                    "fillAlphas": 0.09,
                    "title": null,
                    "precision": this.props.precision >= 0 ? this.props.precision : (modelCfg.aggregate == 'avg' ? 2 : 0),
                    "labelPosition": this.props.labelTop ? 'top' : null,
                    "labelText": this.props.labelTop ? '[[value]]' : null,
                    'labelFunction': function (value) {
                        if (data.length > 24) {
                            let ind = data.length / 24;
                            if (value.index % Math.round(ind) === 0 && value.values.value !== 0) {
                                return value.values.value;
                            } else {
                                return "";
                            }
                        } else {
                            return value.values.value;
                        }
                    },
                    "type": "smoothedLine",
                    "lineColor": colors[i],
                    "fillColors": fill,
                    "valueField": "val" + i
                }, x);

                if (!x.bullet && x.type !== 'column') {
                    x = Object.assign({
                        "bullet": "bubble",
                        "bulletAlpha": 1,
                        "bulletBorderAlpha": 1,
                        "bulletBorderColor": colors[i],
                        "bulletBorderThickness": 3,
                        "bulletColor": "#fff",
                        "bulletSize": 8,
                    }, x);
                }

                return x;
            });
        let valueFields = graphs.map(x => x.valueField);
        data.forEach(x => valueFields.forEach(vf => {
            if (!x[vf]) {
                x[vf] = 0;
            }
        }))
        // console.log('Data itself')
        // console.log(data)
    }

    render() {
        let key = this.state['model_key_' + this.getModelName()];
        const [graphData, valueFields] = this.getGraphData();
        const smt =  graphData.map(x =>
                valueFields.map(field => x[field])
            )
        const data = {
            labels: graphData.map(x => x.day),
            legend: valueFields.map(field => field),
            data: graphData.map((x, i) =>
                valueFields.map(field => x[field])
            ),
            barColors: ["#dfe4ea", "#ced6e0", "#a4b0be"]
        };
        return (
            <View key={key}>
                <StackedBarChart
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
                />
            </View>
        )
    }
}

export default BaseLineChart;
