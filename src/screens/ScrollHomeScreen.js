import {View, ScrollView, StyleSheet} from "react-native";
import {BaseDataPage} from "../components/BaseDataPage";
import {YearsModel} from "../model/Model";

const desc =[
    ["Напитки за все время"]
]

const indicators = [
    ["Напитки"]
].map((x, i) => {
    return [
        {
            type: "sum_all",
            filter: (x) => x[0].indicator === x[0],
            field: x[0],
            desc: desc[i][0],
            compareUnit: "",
            valueField: "value_abs",
            vardate: false,
        },
        {
            type: "sum",
            filter: (x) => x.indicator === x,
            field: x[0],
            desc: desc[i][1],
            prirost: true,
            valueField: "value_abs",
            compareUnit: "",
            vardate: false,
        },
    ];
});
const stackedGraphs = [
    ["Еда", "#4fa2f0"],
    ["Одежда", "#F78641"],
    ["Напитки", "#3751d2"],
];

export const ScrollHomeScreen = () => {
    const data = {
        id: "medotvod_cert_create_day",
        title: "Количество замен иностранной почты",
        indicators: indicators,
        typeId: "medotvod_cert_create_day",
        graphs: [
            {
                labelTop: true,
                title: "Продажи по категориям",
                graphs: stackedGraphs,
                stacked: true,
                typeId: "medotvod_cert_create_day",
                valueField: "value_abs",
            }
        ],
        pies: [
            {
                title: "Соотношение продаж напитков к еде",
                field: "value_abs",
                aggregate: "sum",
                fields: [
                    {
                        text: "Еда",
                        name: "Еда",
                    },
                    {
                        text: "Напитки",
                        name: "Напитки",
                    },
                ],
                colors: ["#16A086", "#FF8A00", "#4E73BE"],
                typeId: "medotvod_cert_create_day",
                category: "indicator",
            },
        ]
    }

    return (
        <ScrollView style={[
            styles.container,

        ]}>
            <BaseDataPage data={data}>
            </BaseDataPage>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 5,
    },
});
