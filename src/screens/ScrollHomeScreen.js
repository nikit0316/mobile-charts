import {View} from "react-native";
import {BaseDataPage} from "../components/BaseDataPage";
import {YearsModel} from "../model/Model";


const stackedGraphs = [
    ["Замен иностранных почт с созданием почты Mail.ru по ВУЗ", "#3751d2", true],
    ["Замен иностранных почт с привязкой другой почты по ВУЗ", "#F78641", true],
    ["Total (количество замен)", "rgba(0, 0, 0, 0)", false],
];

export const ScrollHomeScreen = () => {
    const data = {
        id: "change_mail_alien",
        title: "Количество замен иностранной почты",
        // indicators: indicators,
        typeId: "change_mail_alien",
        graphs: [
            {
                title: "Количество замен иностранной почты",
                graphs: stackedGraphs,
                stacked: true,
                typeId: "change_mail_alien",
                valueField: "value",
            },
        ]
    }
    console.log('model Try')
    console.log(YearsModel.getByTypeId('change_mail_alien', {
        aggregate: 'sum',
        groupFieldVar: 'gr',
        valueField: 'value',
        hierarchy: ['indicator', null]
    }))

    return (
        <View>
            <BaseDataPage data={data}>
            </BaseDataPage>
        </View>
    )
}
