import {View, ScrollView} from "react-native";
import {BaseDataPage} from "../components/BaseDataPage";
import {YearsModel} from "../model/Model";

const desc =[
    ["Всего замен иностранных почт по взрослым УЗ", "Количество замен иностранных почт по взрослым УЗ за период"],
    ["Всего замен иностранных почт с созданием почты Mail.ru по взрослым УЗ", "Количество замен иностранных почт с созданием почты Mail.ru по взрослым УЗ за период"],
    ["Всего замен иностранных почт с привязкой другой почты по взрослым УЗ", "Количество замен иностранных почт с привязкой другой почты по взрослым УЗ за период"]
]

const indicators = [
    ["Замен иностранных почт по ВУЗ", "Количество общего количества регистраций ДУЗ за период"],
    ["Замен иностранных почт с созданием почты Mail.ru по ВУЗ", "Количество регистраций ДУЗ через домен Mail.ru"],
    ["Замен иностранных почт с привязкой другой почты по ВУЗ", "Коэффициент прироста общего количества регистраций ДУЗ за период"],
].map((x, i) => {
    return [
        {
            type: "sum_all",
            filter: (x) => x[0].indicator === x[0],
            field: x[0],
            desc: desc[i][0],
            compareUnit: "",
            vardate: false,
        },
        {
            type: "sum_all",
            filter: (x) => x.indicator === x,
            field: x[0],
            desc: desc[i][1],
            prirost: true,
            compareUnit: "",
            vardate: false,
        },
    ];
});
const stackedGraphs = [
    ["Замен иностранных почт с созданием почты Mail.ru по ВУЗ", "#3751d2", true],
    ["Замен иностранных почт с привязкой другой почты по ВУЗ", "#F78641", true],
    ["Total (количество замен)", "rgba(0, 0, 0, 0)", false],
];

const stackedGraphs2 = [
    ["Успешное создание почты Mail.ru", "#3751d2", true],
    ["Техническая эффективность интеграции ЕПГУ - ВК (Замены почты)", "#3751d2", false],
    ["Отправленные запросы на создание почты Mail.ru", "#3751d2", false]
];
export const ScrollHomeScreen = () => {
    const data = {
        id: "change_mail_alien",
        title: "Количество замен иностранной почты",
        indicators: indicators,
        typeId: "change_mail_alien",
        graphs: [
            {
                labelTop: true,
                title: "Количество замен иностранной почты",
                graphs: stackedGraphs,
                stacked: true,
                typeId: "change_mail_alien",
                valueField: "value",
            },
                {
                    title: 'Техническая эффективность',
                    graphs: stackedGraphs2,
                    stacked: true,
                    typeId: 'tech_effective',
                    valueField: 'value'
                },
        ],
        pies: [
            {
                title: "Соотношение количества замен иностранных почт в разрезе почты",
                field: "value",
                aggregate: "sum",
                fields: [
                    {
                        text: "С созданием почты Mail.ru",
                        name: "Замен иностранных почт с созданием почты Mail.ru по ВУЗ",
                    },
                    {
                        text: "С привязкой другой почты",
                        name: "Замен иностранных почт с привязкой другой почты по ВУЗ",
                    },
                ],
                colors: ["#16A086", "#FF8A00", "#4E73BE"],
                typeId: "change_mail_alien",
                category: "indicator",
            },
        ]
    }

    return (
        <ScrollView>
            <BaseDataPage data={data}>
            </BaseDataPage>
        </ScrollView>
    )
}
