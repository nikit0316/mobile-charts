import {LineChart} from "react-native-chart-kit";
import {View, Dimensions} from "react-native";
import ModelComponent from "./ModelComponent";

const defaultColors = [
    '#FFF',
    '#000000',
    '#0330db'
]
class BaseLineChart extends ModelComponent {

    constructor(p) {
        super(p);

        this.refChart = this.refChart.bind(this);
    }

    getCategoryField() {
        return this.state.categoryField || '_category';
    }

    getCategoryFieldValue() {
        return this.getCategoryField();
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

    refChart(el) {
        if (!el) {
            return;
        }

        let colors = (this.state.colors || []).concat(defaultColors),
            data = this.getData(),
            modelCfg = this.model.getConfig(),
            graphs = this.state.graphs.filter(x => !x.valueField || data.find(d => d[x.valueField])).map((x, i) => {
                console.log('Hi')
                console.log(x)
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
                console.log('Bye')
                console.log(x);

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
            }),
            valueFields = graphs.map(x => x.valueField);
        console.log('valueFields')
        console.log(valueFields)
        data.forEach(x => valueFields.forEach(vf => {
            if (!x[vf]) {
                x[vf] = 0;
            }
        }))
        console.log('Data itself')
        console.log(data)
    }

    render() {
        let key = this.state['model_key_' + this.getModelName()];
        return (
            <View key={key} ref={this.refChart}>
                <LineChart
                    data={{
                        labels: ["January", "February", "March", "April", "May", "June"],
                        datasets: [
                            {
                                data: [
                                    Math.random() * 100,
                                    Math.random() * 100,
                                    Math.random() * 100,
                                    Math.random() * 100,
                                    Math.random() * 100,
                                    Math.random() * 100
                                ]
                            }
                        ]
                    }}
                    width={Dimensions.get("window").width} // from react-native
                    height={220}
                    yAxisLabel="$"
                    yAxisSuffix="k"
                    yAxisInterval={1} // optional, defaults to 1
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
                    bezier
                    style={{
                        marginVertical: 8,
                        borderRadius: 16
                    }}
                />
            </View>
        )
    }
}

export default BaseLineChart;
