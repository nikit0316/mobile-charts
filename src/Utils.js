import { getFilterText } from "./model/Model"

const numFormat = new Intl.NumberFormat('ru-RU');
const dateFormat = new Intl.DateTimeFormat('ru-Ru');

const dayToDate = day => day ? new Date(day / 10000, day / 100 % 100 - 1, day % 100) : null;
const dateToDay = dt => dt.getFullYear() * 10000 + (dt.getMonth() + 1) * 100 + dt.getDate();

const round = function (num, decimalPrecision) {
    if (decimalPrecision >= 0) {
        var p = Math.pow(10, decimalPrecision);
        return parseInt(num * p) / p;
    }

    return num;
}

const format = function (num) {
    if (num + 0 === num) {
        return numFormat.format(Math.round(num * 100) / 100);
    }

    if (num === null || isNaN(num)) {
        return '';
    }

    if (num instanceof Date) {
        return dateFormat.format(num);
    }

    return num;
}

const formateCompare = (num, percentage, unit) => num ? [num > 0 ? up : down, <span>{format(num)}{percentage ? '%' : unit || ''}</span>] : format(num);

const months = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
    short_months = ['янв', 'фев', 'март', 'апр', 'мая', 'июня', 'июля', 'авг', 'сен', 'окт', 'ноя', 'дек'],
    quarters = ['1 квартал', '2 квартал', '3 квартал', '4 квартал'];

const applyVarText = function (t, v, need, indicator) {
    if (v && need) {
        var ag = getFilterText('ag', indicator);
        if (ag) {
            t += ' ' + ag;
        }
    }

    return t;
}

const getGraphFieldCfg = (text, name, color, grapthtype, filter, type) => {
    return {
        "fillAlphas": grapthtype == 'smoothedLine' ? 0 : 1,
        lineAlpha: grapthtype == 'smoothedLine' ? 1 : 0,
        "fillColors": color,
        "lineColor": color,
        "type": grapthtype || 'column',
        title: text || name,
        valueField: name || text,
        filter,
        'newStack': type
    }
};

const today = new Date(),
    date_periods = [
        dateToDay(today),
        dateToDay(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10)),
        dateToDay(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 60))
    ],
    namePeriods = [
        ['За последние 7 дней'],
        ['За последние 30 дней'],
        ['За последние 12 мес.'],
        ['За 12 месяцев']
    ],
    namePeriodDateDayMap = namePeriods.reduce((a, b, i) => { b.forEach(bb => a[bb] = date_periods[i]); return a; }, {});

export {
    format,
    dayToDate,
    formateCompare,
    months,
    short_months,
    quarters,
    applyVarText,
    getGraphFieldCfg,
    dateToDay,
    round,
    namePeriods,
    namePeriodDateDayMap
};
