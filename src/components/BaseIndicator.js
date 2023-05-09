import { YearsModel } from '../model/Model';
import { applyVarText, dayToDate, format, formateCompare, round } from '../Utils';
import {View, Text} from "react-native";
import ModelComponent from './ModelComponent';

/**
 * props = {
 *  type = 'last'/'change'
 *  typeId = null
 *  filter = x => x
 *  field: 'fieldName',
 *  compare: true
 *  desc: 'Описание'
 * }
 * */
export class Indicator extends ModelComponent {
    createModel() {
        if (this.props.typeId) {
            var model = YearsModel.getByTypeId(this.props.typeId, {
                name: this.props.modelName,
                aggregate: this.props.type === 'max' ? 'max':null,
                valueField: this.props.field,
                groupFieldVar: this.props.groupFieldVar||'ag',
                hierarchy: [null],
                filter: this.props.filter
            });

            this.modelName = model.getName();
            return model;
        }

        return ModelComponent.prototype.createModel.apply(this, arguments);
    }

    getCompare(num) {
        var prev = this.model.data.previous;
        if (/**this.props.compare && /**/prev && prev.length) {
            var compare = this.model.calcPrevious(this.props.field, this.props.type/**, this.props.filter/**/);
            if (compare) {
                return parseInt((num - compare) * 10000 / compare) / 100;
            }
        }
    }

    buildCompare(num) {
        if (this.props.compare !== false) {
            var compare = this.getCompare(num);
            if (compare) {
                return <span className={compare > 0 ? 'num-up' : compare < 0 ? 'num-down' : null}>{formateCompare(compare, this.props.compareUnit === undefined || this.props.percent, this.props.compareUnit)}</span>;
            }
        }
    }

    render() {
        /**
         var data = this.model.data;
         if (this.props.filter) {
            data = data.filter(this.props.filter);
        }
         data = data.map(x => x[this.props.field]).filter(x => x);
         /**/
        var num = this.model.calc(this.props.field, this.props.type/**, this.props.filter/**/),
            date_load;
        if (num) {
            date_load = num.date_day;
            if (date_load) {
                date_load = <span name="date_load">{format(dayToDate(date_load))}</span>;
            }

            num = parseInt(num[this.props.field]) || num;
        }

        return <View>
            <View>
                <Text>{this.props.prirost ? format(round(this.model.countPrirost(this.props.field, this.props.type))) : format(round(num, this.props.decimalPrecision))}{this.props.unit} {this.buildCompare(num) || null} {date_load} {this.props.details ? <a href="#">Подробнее</a> : null}</Text>
            </View>
            <Text className="text-helper">{applyVarText(this.props.desc, 'ag', this.props.vardate, this.props.perDay)}</Text>
            {/*{this.getShimmer()}*/}
        </View>;
    }
}

export class BaseIndicator extends Indicator {
    getCompare(num) {
        if (this.props.compare === true && this.model.data && this.model.data.rawData){
            var prev = this.model.data.previous;
            if (/**this.props.compare && /**/prev && prev.length) {
                var compare = this.model.calcPrevious(this.props.field, this.props.type/**, this.props.filter/**/);
                if (compare) {
                    return parseInt(this.model.countPrirost(this.props.field, this.props.type, this.props.percent));
                }
            }
        }
        if (this.props.compare && this.model.data && this.model.data.rawData) {
            var result = this.model.calc(this.props.field + '/' + this.props.compare, this.props.type, this.props.filter);
            // if ((result + '') == result) {
            return result;
            // }

            return this.model.data.rawData.filter(x => x.pokaz === this.props.field)[0];
        }
    }
}
