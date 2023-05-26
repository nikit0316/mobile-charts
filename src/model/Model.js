import {dateToDay, dayToDate, months, namePeriodDateDayMap, namePeriods, short_months} from "../Utils"
import Config from "./Config";
import jsondata from "./data";
import {LogBox} from "react-native";

const domain = 'https://localhost:5001';
const token = '?externalToken=09dd63f1848343dea7d26eb2f7bc5342';

const models = {};

const findModelConfig = function (model) {
    for (var name in models) {
        if (models[name].model === model) {
            return models[name];
        }
    }
}
/*let firstMonth = date.getMonth()-4;
if (firstMonth / 10 < 1) {
    firstMonth = '0' + firstMonth;
}
let month = date.getMonth() + 1;
if (month / 10 < 1) {
    month = '0' + month;
}
let day = date.getDate();
if (day / 10 < 1) {
    day = '0' + day;
}
let firstDate = date.getFullYear() + '' + firstMonth + '' + day;
date = date.getFullYear() + '' + month + '' + day;*/
var datesCal = [20220506, 20220508];

var groupVariable = 1;

const vars = {
        month: 2,
        year: 0,
        day: 1
    },
    fetchs = {
        /*
         typeId: fetch
         */
    };

var listners = [],
    getListeners = function (n) {
        return listners[n] || (listners[n] = []);
    },
    fire = function (n, d) {
        getListeners(n).forEach(l => l(d));
    };


export const filterValues = [
    'За последние 7 дней',
    'За последние 30 дней',
    'За 12 месяцев'
].filter(x => x);

export const filterTexts = [
    'за последние 7 дней',
    'за последние 30 дней',
    'за последние 12 мес.'
];

export const indicatorFilterTexts = [
    'в день',
    'в день',
    'в месяц'
];

export var getFilterText = (name, indicator) => (indicator ? indicatorFilterTexts : filterTexts)[vars[name]];

const groupFields = ['date_year', 'date_day', 'date_mounth'];

export const calc = function (data, field, ag, filter) {
    data = data.filter(x => x !== undefined);
    if (filter) {
        data = data.filter(filter);
    }

    if (field) {
        switch (ag) {
            case 'min':
                return data.sort((x, y) => x[field] > y[field] ? 1 : -1)[0];
            case 'max':
                return data.sort((x, y) => y[field] > x[field] ? 1 : -1)[0];
            case 'prirost_first': {
                data = data.filter(x => x.date_day).filter(x => x.date_day >= datesCal[0])
            };
            case 'prirost_last': {
                data = data.filter(x => x.date_day).filter(x => x.date_day >= datesCal[0] && x.date_day <= datesCal[1])
            };
            case 'sum_period': {
                data = data.filter(x => x.date_day).filter(x => x.date_day >= datesCal[0] && x.date_day <= datesCal[1])
            };
            case 'avg_all': {
                data = data.filter(x => x.date_day).filter(x => x.date_day >= datesCal[0] && x.date_day <= datesCal[1])
            }
            default:
                data = data.map(x => (x[field]))
                break;
        }
    }

    switch (ag) {
        case 'change':
            return data[data.length - 1] - data[0];
        case 'percent':
            return (data[data.length - 1] - data[0]) * 100 / data[0];
        case 'first':
            return data[0];
        case 'last':
            return data.reduce((a, b) => b === undefined ? a : b, 0)
        case 'sum':
            return data.filter(x => x).reduce((a, b) => b === undefined ? a : a + b, 0);
        case 'sum_period':
            return data.filter(x => x).reduce((a, b) => b === undefined ? a : a + b, 0);
        case 'sum_all':
            return data.filter(x => x).reduce((a, b) => b === undefined ? a : a + b, 0);
        case 'prirost_first': {
            return data[0]
        }
        case 'prirost_last': {
            return data.filter(x => x).reduce((a, b) => b === undefined ? a : a + b, 0)
        }
        case 'avg_all':
            return data.filter(x => x).reduce((a, b) => a + b, 0) / data.length;
        case 'avg':
            return data.filter(x => x).reduce((a, b) => a + b, 0) / data.length;
        case 'max':
            return Math.max(...data);
        case 'min':
            return Math.min(...data);
        default:
            return data;
    }
}

const applyAggregate = function (cfg, data) {
    if (cfg.aggregate == 'last' && data.length) {
        var d = calc(data, 'date_day', 'min').date_day,
            last, c,
            max = calc(data, 'date_day', 'max').date_day;

        if (d && max) {
            while (d < max) {
                c = data.filter(x => x.date_day == d);

                if (c.length) {
                    last = c;
                } else {
                    last.forEach(x => data.push(Object.assign({}, x, {date_day: d})));
                }

                d = dateToDay(dayToDate(d + 1));
            }
        }
    }
}

const applyDateDay = function (cfg, data) {
    data && data.forEach(x => {
        /** PlainModel -> x.name_period === name_period /**/
        if (!x.date_day && !x.name_period) {
            x.name_period = 'За последние 12 мес.'
        }
        if (!x.date_day && x.name_period) {
            x.date_day = namePeriodDateDayMap[x.name_period];
        }
        /**/
        if (x.date_day) {
            x.date_mounth = parseInt((x.date_day % 10000) / 100)  + '.' + (x.date_day / 10000).toString().slice(2,4);
            x.date_year = parseInt(x.date_day / 10000);
        }
    });
}

export default class Model {
    static prefix = 'model_'

    data = []

    constructor(config) {
        this.data = [];
        models[config.name] = Object.assign({
            model: this,
            variables: [],
            aggregate: Config[config.typeId] && Config[config.typeId].aggregate
        }, config);
    }

    /**
     * @returns {Model}
     * */
    static get(name) {
        return models[name] && models[name].model;
    }

    static getByTypeId(typeId, cfg) {
        if (!cfg) {
            cfg = {};
        }

        var name = cfg.name || (this.prefix + typeId + (cfg.variables ? '[' + cfg.variables.join('|') + ']' : '') + (cfg.groupFieldVar || '') + (cfg.aggregate || '')),
            m = Model.get(name);

        if (!m) {
            if (!cfg) {
                cfg = {};
            }

            cfg.name = name;
            cfg.typeId = typeId;

            m = new this(Object.assign(this.getDefaultConfig(cfg), cfg));
        }

        return m;
    }

    /**
     * Variable setter
     * @param {string} variable_name
     * @param {any} variable_value
     */

    static setGroup(group) {
        groupVariable = vars[group];
        let needClear = [];
        for (var model in models) {
            var cfg = models[model];
            if (((cfg.groupFieldVar === 'gr')) &&
                needClear.indexOf(cfg.model) === -1) {
                needClear.push(cfg.model);
            }
        }

        needClear.forEach(x => x.getData().then(() => x.applyData()));
    }

    static setDate(name, startDate, endDate) //Start and end dates setter for model
    {
        datesCal[0] = startDate;
        datesCal[1] = endDate;

        let needClear = [];
        for (var model in models) {
            var cfg = models[model];
            if (((cfg.groupFieldVar === name)) &&
                needClear.indexOf(cfg.model) === -1) {
                needClear.push(cfg.model);
            }
        }

        needClear.forEach(x => x.getData().then(() => x.applyData()));
    }

    static set(name, value) {
        if (arguments.length > 1) {
            var p = {};
            p[name] = value;
            name = p;
        }

        var needClear = [];
        for (var param in name) {
            value = name[param];

            var old = vars[param];
            vars[param] = value;
            if (old !== value) {
                for (var model in models) {
                    var cfg = models[model];
                    if (((cfg.groupFieldVar === param || cfg.variables.indexOf(param) >= 0)) &&
                        needClear.indexOf(cfg.model) === -1) {
                        needClear.push(cfg.model);
                    }
                }
            }
        }

        needClear.forEach(x => x.getData().then(() => x.applyData()));
    }

    /**
     * Variable setter
     * @param {string} variable_name
     * @param {any} variable_value
     */
    static getVariable() {
        return groupVariable;
    }

    getConfig() {
        return findModelConfig(this);
    }

    get(field, index = 0) {
        return this.data.map(x => x[field])[index];
    }

    countPrirost(field, type, percent) {
        if (type === 'sum_all') {
            var last = this.calc(field, 'prirost_last');
            var first = 0;
            if (first === undefined || first === last){
                first = 0;
            }
        } else {
            var last = this.calc(field, 'last');
            var first = this.calc(field, 'first');
        }
        let change = last - first;
        if (percent === true) {
            change = change * 100 / first;
        }
        return change;
    }

    calc(field, ag, filter) {
        if (ag == 'change' || ag == 'percent') {
            var last = this.calc(field, 'last', filter),
                first = (this.calcPrevious(field, 'last', filter) || this.calc(field, 'first', filter)),
                change = last - first;

            return ag == 'percent' ? change * 100 / first : change;
        } /**else if (ag == 'avg') {
            return calc(this.data.reduce((a, b) => a.concat(b._data[field]), []), null, ag, filter);
        }/**/

        return calc(this.data, field, ag, filter);
    }

    calcPrevious(field, ag, filter) {
        if (this.data.previous && this.data.previous.length) {
            /**if (ag == 'avg') {
                return calc(this.data.previous.reduce((a, b) => a.concat(b._data[field]), []), null, ag, filter);
            }/**/

            return calc(this.data.previous, field, ag, filter);
        }
    }

    getName() {
        return findModelConfig(this).name;
    }

    getData() {
        var cfg = findModelConfig(this);
        if (!cfg.fetch && cfg.data && this.data) {
            return Promise.resolve(this.data);
        }

        return this.load();
    }

    listen(fn) {
        getListeners(this.getName()).push(fn);
        setTimeout(_ => this.getData().then(x => fn(x)));

        return () => this.unlisten(fn);
    }

    unlisten(fn) {
        listners[this.getName()] = getListeners(this.getName()).filter(x => x !== fn);
    }

    buildRequestBody(body) {
        body.append('storageParams', JSON.stringify({}));
        this.summaryRowParams && body.append('summaryRowParams', JSON.stringify({}));
        this.select && body.append('select', JSON.stringify([]));
    }

    load() {
        var cfg = findModelConfig(this);
        if (!cfg.fetch) {
            if ( 32 !== '35') {
                cfg.fetch = Promise.resolve(jsondata[cfg.typeId]);
            } else {
                if (!fetchs[cfg.typeId]) {
                    var body = new FormData();
                    this.buildRequestBody(body);

                    this.loading = true;
                    fetchs[cfg.typeId] = fetch(domain + "/api/" + cfg.typeId + "/PostList" + token, {
                        body: body,
                        method: "POST",
                        mode: "cors",
                        credentials: "include"
                    })
                        .then(x => {
                            if (x.redirected && x.url) {
                                var indx = x.url.indexOf('login/?ReturnUrl=');
                                if (indx >= 0) {
                                    return document.location.href = x.url.substr(0, indx + 17) + encodeURIComponent(document.location.href.substr(indx - 1));
                                }
                            }

                            this.loading = false;
                            delete fetchs[cfg.typeId];
                            return x.json();
                        });
                }

                cfg.fetch = fetchs[cfg.typeId];
            }

            cfg.fetch = cfg.fetch.then(x => {
                var cfg = findModelConfig(this);
                if (!x) {
                    cfg.error = 'Не удалось агрузить данные';
                    x = {data: []};
                }

                cfg.data = x.data;
                applyAggregate(cfg, cfg.data);
                applyDateDay(cfg, cfg.data);
                return this.applyData();
            });
        }

        return cfg.fetch;
    }

    applyData() {
        var cfg = findModelConfig(this);
        try {
            return this.dataLoaded(cfg.data, cfg);
        } finally {
            this.data.rawData = cfg.data;

            delete cfg.fetch;
            delete cfg.error;
            fire(this.getName(), this.data);
        }
    }

    dataLoaded(x, cfg) {
        return this.data = x;
    }
}

const dtRanges = function (data, varv, count, yearsCount) {
    var dt;
    /**
     if (varv) {
        dt = new Date();
        dt = new Date(dt.getFullYear(), dt.getMonth(), 1);
    } else {/**/
    var ldt = Math.max(...data.map(x => x.date_day).filter(x => x));
    var dates = [];
    for (var y = 0; y < (yearsCount || 1); y++) {
        ldt -= y * 10000;
        dt = new Date(parseInt(ldt / 10000), parseInt(ldt / 100 % 100) - 1, parseInt(ldt % 100));
        //}

        if (varv > 1) {
            dt = new Date(dt.getFullYear(), dt.getMonth() + 1, 0);
        }

        for (var i = 1; i <= count; i++) {
            var ndt = new Date(dt.getFullYear() - (varv > 1 ? 1 : 0), dt.getMonth() - (varv === 1 ? 1 : 0), dt.getDate() - (!varv ? 7 : 0));
            dates.push([dateToDay(ndt), dateToDay(dt)]);
            dt = ndt;
        }
    }

    return dates;
}

export class PlainModel extends Model {
    static prefix = 'plainmodel_'
    static getDefaultConfig = () => {
        return {
            variables: ['ag']
        }
    }

    dataLoaded(x, cfg) {
        const varv = vars[cfg.groupFieldVar],
            groupField = groupFields[varv],
            name_periods = namePeriods[varv];

        if (cfg.filter) {
            x = x.filter(cfg.filter);
        }

        this.data = x
            .map(x => {
                if (!x.month && x.date_mounth) {
                    x.month = months[x.date_mounth - 1] + '.' + (x.date_day / 10000).toString().slice(2,4);
                    x.day = (x.date_day % 100) + ' ' + short_months[parseInt((x.date_day % 10000) / 100) - 1];
                }
                return x;
            })
            .sort((a, b) => parseInt(a[groupField]) > parseInt(b[groupField]) ? 1 : -1);

        var dates = dtRanges(x, varv, 2);
        // this.data = this.data.filter(x => (name_periods && name_periods.indexOf(x.name_period) >= 0) || (x.date_day > dates[0][0]));
        if (cfg.aggregate !== 'sum_all') {
            this.data.previous = this.data.filter(x => (x.date_day >= datesCal[0] && x.date_day <= datesCal[1]) || (name_periods && name_periods.indexOf(x.name_period) >= 0));
            this.data = this.data.filter(x => x.date_day >= datesCal[0] && x.date_day <= datesCal[1]);
        } else {
            this.data.previous = this.data;
        }
        return this.data;
    }
}

const dtSort = function (result) {
    var m = new Date().getMonth() + 1;
    result.forEach(x => x._pm || (x._pm = -(parseInt(x.date_year) || 3000) * 100 - x.date_mounth - (x.date_mounth <= m ? 12 : 0)));

    return result.sort((a, b) => a._var_date - b._var_date);

    return result.sort((a, b) => -a._pm + b._pm);
}

const aggregateArray = function (data, cfg, arrayField, defaultAg) {
    var ag = Config[cfg.typeId];
    if (ag || cfg.aggregate || defaultAg) {
        data = data.map(x => {
            if (defaultAg) {
                for (var f in x[arrayField]) {
                    x[f] = calc(x[arrayField][f], null, defaultAg);
                }
            }

            if (ag) {
                for (var f in x[arrayField]) {
                    var agf = ag.fields && ag.fields[f] || ag.aggregate;
                    if (agf) {
                        x[f] = calc(x[arrayField][f], null, agf);
                    }
                }
            }

            if (cfg.aggregate) {
                for (var f in x[arrayField]) {
                    x[f] = calc(x[arrayField][f], null, cfg.aggregate);
                }
            }

            return x;
        });
    }

    return data;
}

export class YearsModel extends Model {
    static prefix = 'list_year_months_'
    static getDefaultConfig = () => {
        return {
            hierarchy: ['date_year'],
            groupFieldVar: 'gr',
            variables: ['gr'],
            yearsCount: 1
        }
    }

    dataLoaded(x, cfg) {
        var varv = vars[cfg.groupFieldVar],
            dates = dtRanges(x, varv, 1 + (cfg.groupFieldVar == 'ag' ? 1 : 0), cfg.yearsCount + (cfg.groupFieldVar == 'ag' ? 0 : 1)),
            cd = cfg.yearsCount ? dates.filter((x, i) => i < (dates.length - 1)) : dates,
            pd = dates.filter((x, i) => i);

        if (cfg.aggregate !== 'sum_all') {
            var cur = this.loadPeriod(x.filter(x => cd.find(dt => x.date_day >= datesCal[0] && x.date_day <= datesCal[1])), cfg),
                prev = this.loadPeriod(x.filter(x => pd.find(dt => x.date_day >= datesCal[0] && x.date_day <= datesCal[1])), cfg);
        } else {
            var cur = this.loadPeriod(x.filter(x => cd.find(dt => x.date_day >= 0)), cfg),
                prev = this.loadPeriod(x.filter(x => pd.find(dt => x.date_day >= 0)), cfg);
        }
        if (varv > 1) {
            cur = dtSort(cur);
            prev = dtSort(prev);
        }

        this.data = cur;
        this.data.previous = prev;
        return this.data;
    }

    loadPeriod(x, cfg) {
        const varv = vars[cfg.groupFieldVar],
            groupField = groupFields[groupVariable];

        if (cfg.filter) {
            x = x.filter(cfg.filter);
        }

        x = this.reduceData(x, cfg, 'date_day', cfg.hierarchy)
            .sort((a, b) => a.date_day - b.date_day);
        if (varv > 1) {
            x = this.reduceData(x, Object.assign({}, cfg, {valueField: (Array.isArray(cfg.valueField) ? cfg.valueField : [cfg.valueField]).concat(x.hiearachies || [])}), groupField, cfg.hierarchy)
                .sort((a, b) => a.date_day - b.date_day);

            x = aggregateArray(x, cfg, '_data');
        }

        return x.sort((a, b) => a._var_date - b._var_date);
    }

    reduceData(data, cfg, groupField, hierarchy) {
        data.forEach(x => {
            switch (groupField) {
                case 'date_mounth':
                    x.groupDate = parseInt(x.date_day / 100);
                    break;

                case 'date_day':
                    x.groupDate = x.date_day;
                    break;

                default:
                    break;
            }
        });

        var hiearachies = [];
        var result = data.reduce((rv, x) => {
            var day = (rv.find(rx => rx.groupDate === x.groupDate) || rv[rv.push({_data: {}}) - 1]);
            if (!day._var_date) {
                day.date_mounth = x.date_mounth;
                day.groupDate = x.groupDate;
                switch (groupField) {
                    case 'date_mounth':
                        day.month = months[parseInt(x.date_mounth.split('.')[0]) - 1] + '.' + (x.date_day / 10000).toString().slice(2,4);
                        day.day = (day.date_day % 100) + ' ' + short_months[parseInt((day.date_day % 10000) / 100) - 1];
                        x._var_date = parseInt(x.date_day / 100);
                        break;

                    case 'date_day':
                        day.date_day = x.date_day;
                        day.day = (day.date_day % 100) + ' ' + short_months[parseInt((day.date_day % 10000) / 100) - 1];
                        x._var_date = x.date_day % 10000;
                        break;

                    default:
                        break;
                }
            }

            if (!day.date_day || (day.date_day > x.date_day)) {
                day.date_day = x.date_day;
            }

            this.reduceDay(day, x, cfg, hierarchy, hiearachies).forEach(hiearachyName => {
                if (hiearachies.indexOf(hiearachyName) < 0) {
                    hiearachies.push(hiearachyName);
                }
            });

            for (let i = 1; i < rv.length; i++) {
                if (rv[i]._data) {
                }
            }
            return rv;
        }, []);

        result.hiearachies = hiearachies;

        return result;
    }

    reduceDay(day, x, cfg, hierarchy, hiearachies) {
        var _data = day._data,
            valueFields = Array.isArray(cfg.valueField) ? cfg.valueField : [cfg.valueField || 'value'],
            name = hierarchy.map(h => x[h]).join('/'),
            nvf;

        valueFields.forEach((vf, i) => {
            if (x[vf]) {
                day[vf] = (day[vf] || 0) + x[vf];
                (_data[vf] || (_data[vf] = [])).push(x[vf]);

                if (name && !i) {
                    day[name] = (day[name] || 0) + x[vf];
                    (_data[name] || (_data[name] = [])).push(x[vf]);
                }

                nvf = name + '/' + vf;
                day[nvf] = (day[nvf] || 0) + x[vf];
                (_data[nvf] || (_data[nvf] = [])).push(x[vf]);
            }
        });

        return valueFields.map(vf => name + '/' + vf).concat([name]);
    }
}

export class TimesModel extends Model {
    static get(typeId, col, count_col) {
        var name = 'timemodel_' + typeId,
            m = Model.get(name);

        if (!m) {
            m = new TimesModel({
                name,
                variables: ['ag'],
                typeId,
                col,
                count_col
            });
        }

        return m;
    }

    pushData(c, b, cfg) {
        var f = b[cfg.col],
            arr = (c._data[f] || (c._data[f] = [])),
            day = b.date_day % 100,
            v = b[cfg.count_col] || 0;

        arr[day] = (arr[day] || 0) + v;
        c[f] = (c[f] || 0) + v;
    }

    dataLoaded(data, cfg) {
        this.data = data;//.filter(x => !x.date_day);
        var cols = [],
            years = [];
        this.data = data.sort((a, b) => a.date_day - b.date_day).reduce((a, b) => {
            // month
            if (b.date_mounth) {
                var c = a.find(x => x.date_year === b.date_year && x.date_mounth === b.date_mounth);
                if (!c) {
                    a.push(c = {
                        date_year: b.date_year,
                        date_mounth: b.date_mounth  + '.' + (b.date_day / 10000).toString().slice(2,4),
                        month: months[b.date_mounth - 1]  + '.' + (b.date_day / 10000).toString().slice(2,4),
                        day: (b.date_day % 100) + ' ' + short_months[parseInt((b.date_day % 10000) / 100) - 1],
                        _data: {}
                    });

                    c.month = c.month[0].toUpperCase() + c.month.substr(1);
                }

                this.pushData(c, b, cfg);
            }

            // cols, years
            cols.indexOf(b[cfg.col]) < 0 && cols.push(b[cfg.col]);
            b.date_year && (years.indexOf(b.date_year) < 0) && years.push(b.date_year);

            return a;
        }, []);

        this.data = aggregateArray(this.data, cfg, '_data');
        this.data.forEach(x => delete x._data);

        years.forEach(date_year => {
            var monthDatas = this.data.filter(x => x.date_year === date_year).reduce((a, b) => {
                for (var f in b) {
                    if (f != 'date_mounth' && f != 'date_year' && f != 'month') {
                        (a[f] || (a[f] = [])).push(b[f]);
                    }
                }

                return a;
            }, {});

            this.data.push({
                ...aggregateArray([{_data: monthDatas}], cfg, '_data', 'sum')[0],
                date_year: date_year
            });
        })

        this.data.cols = cols;
        this.data.years = years.sort(x => -x);
    }
}

Model.set({
    ag: 1,
    gr: 2
});
