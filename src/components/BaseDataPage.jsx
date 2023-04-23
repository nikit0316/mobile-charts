import Model, { PlainModel, YearsModel } from '../model/Model';
import {
    LineChart,
} from "react-native-chart-kit";
import {Text, View} from "react-native";
import {Part} from "./Part";
import {getGraphFieldCfg} from "../Utils";
import BaseLineChart from "./BaseLineChart";
var getGraphModelName = (typeId,ag, valueField = 'value', hierarchies = ['indicator', null]) => YearsModel.getByTypeId(typeId, {
    aggregate: ag,
    groupFieldVar: 'gr',
    valueField: valueField,
    hierarchy: hierarchies
}).getName();

const getIndicatorsModelName = (typeId, valueField = 'value', typeAg) => YearsModel.getByTypeId(typeId, {
    groupFieldVar: 'ag',
    name: typeId + '_ind',
    aggregate: typeAg,
    valueField: valueField,
    hierarchy: ['indicator']
}).getName();

export const BaseDataPage = (props) => {
    const {graphs, id, title, indicators, details, pies, tables} = props.data;
    const buildIndicatorRows = () => {
        if (indicators) {
            var k = 0;
            return indicators.map(r => <div className="row">
                {r.map(x => <CovidIndicator
                    key={'ind1' + (k++)}
                    modelName={getIndicatorsModelName(x.typeId || typeId, x.valueField, x.type)}
                    type={x.type}
                    prirost={x.prirost}
                    decimalPrecision={0}
                    field={x.field}
                    compare={x.compare}
                    compareUnit={x.compareUnit}
                    desc={x.desc}
                    percent={x.percent}
                    vardate={x.vardate} />)}
            </div>);
        }
    }

    const buildStackedGraph = () => {
        if (graphs) {
            return graphs.map(graph => {
                var graphs = graph.graphs.map(x => Array.isArray(x) ? getGraphFieldCfg(x[0], x[0] + '/', x[1], graph.graphtype,'',x[2]) : x),
                    colors = graphs.map(x => x.lineColor),
                    ag = graph.aggregate || (graph.stacked ? 'sum' : 'max');
                return <View className="panel" style={{display: graph.hide ? 'none' : "flex"}}>
                    <Text>{graph.title}</Text>
                    <BaseLineChart
                        group={Model.getVariable()}
                        sort={false}
                        exportHolder={graph.exportHolder}
                        switchable={graph.switchable}
                        labelTop={graph.labelTop ? true : false}
                        modelName={getGraphModelName(graph.typeId || typeId, ag, graph.valueField, graph.hierarchies)}
                        valueAxes={graph.stacked ? [{ stackType: 'regular' }] : null}
                        graphs={graphs}
                        colors={colors} />
                </View>;
            });
        }
    }

    const buildTables = () => {
        if (tables) {
            return tables.map(x => <Table
                title={x.title}
                modelName={PlainModel.getByTypeId(x.typeId || typeId, { groupFieldVar: 'ag', aggregate: x.aggregate }).getName()}
                postAggregate={x.postAggregate}
                cols={x.cols}
                exportHolder={x.exportHolder}
                filter={x.filter}
                sort={x.sort || ['value', -1]}
                indicators={['region']} />);
        }
    }

    const buildPies = () => {
        if (pies) {
            return pies.map(pie => {
                var res = <PiePanel
                    aggregate={pie.aggregate}
                    typeId={pie.typeId || typeId}
                    field={pie.field}
                    category={pie.category}
                    fields={pie.fields}
                    colors={pie.colors || pie.fields.map(x => x.color)}
                    title={pie.title}
                />;

                if (pie.title) {
                    res = <div className="panel">
                        {/*<PieDate ag={pie.aggregate} title={pie.title}/>*/}
                        {res}
                    </div>
                }

                return res;
            });
        }
    }

        return <Part id={id} title={title} details={details}>
            {buildIndicatorRows()}
            {buildStackedGraph()}
            {buildPies()}
            {buildTables()}
        </Part>;
}

const PieDate = () =>{
        return <div>
            <h4>{props.title}</h4>
            <span>{applyVarText('', 'ag', true)}:</span>
        </div>
}
