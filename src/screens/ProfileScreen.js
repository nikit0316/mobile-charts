import {
    LineChart,
} from "react-native-chart-kit";
import * as React from 'react';
import {View, Dimensions, Text, StyleSheet} from 'react-native';
import {useState} from "react";
import {Calendar} from "react-native-calendars";
import moment from "moment";
import {Button, RadioButton} from "react-native-paper";


export const SettingsScreen = () => {
    const screenWidth = Dimensions.get("window").width;
    const [startDate, setStartDate] = useState(moment().subtract(1, 'month'));
    const [endDate, setEndDate] = useState(moment());
    const [indChecked, setIndChecked] = React.useState('first');
    const [graphChecked, setGraphChecked] = React.useState('first');
    const [pieChecked, setPieChecked] = React.useState('first');


    return (
        <View style={[
            styles.container
        ]}>
            <Calendar
                markingType="period"
                onDayPress={day => {
                    setStartDate(day.dateString)
                }}
                onDayLongPress={day => {
                setEndDate(day.dateString)}
                }
                markedDates={{
                    [startDate]: { color: 'yellow' },
                    [endDate]: { color: 'yellow' }
                }}
            />
            <View style={[
                styles.container,
                {
                    // Try setting `flexDirection` to `"row"`.
                    flexDirection: 'row',
                },
            ]}>
                <Button mode={'text'}>День</Button>
                <Button mode={'text'}>Месяц</Button>
                <Button mode={'text'}>Год</Button>
            </View>
            <Text>Настройки для индикаторов</Text>
            <View style={[
                styles.container,
                {
                    // Try setting `flexDirection` to `"row"`.
                    flexDirection: 'row',
                },
            ]}>
            <RadioButton
                value="first"
                status={ indChecked === 'first' ? 'checked' : 'unchecked' }
                onPress={() => setIndChecked('first')}
            />
                <Text>Сумма за период</Text>
            <RadioButton
                value="second"
                status={ indChecked === 'second' ? 'checked' : 'unchecked' }
                onPress={() => setIndChecked('second')}
            />
                <Text>Среднее</Text>
                <RadioButton
                    value="third"
                    status={ indChecked === 'third' ? 'checked' : 'unchecked' }
                    onPress={() => setIndChecked('second')}
                />
                <Text style={{textAlign: 'center'}}>Прирост</Text>
            </View>
            <Text>Настройки для графиков</Text>
            <View style={[
                styles.container,
                {
                    // Try setting `flexDirection` to `"row"`.
                    flexDirection: 'row',
                },
            ]}>
                <RadioButton
                    value="first"
                    status={ graphChecked === 'first' ? 'checked' : 'unchecked' }
                    onPress={() => setGraphChecked('first')}
                />
                <Text>Без аггрегации</Text>
                <RadioButton
                    value="second"
                    status={ graphChecked === 'second' ? 'checked' : 'unchecked' }
                    onPress={() => setGraphChecked('second')}
                />
                <Text>Среднее</Text>
                <RadioButton
                    value="third"
                    status={ graphChecked === 'third' ? 'checked' : 'unchecked' }
                    onPress={() => setGraphChecked('second')}
                />
                <Text style={{textAlign: 'center'}}>Суммирование</Text>
            </View>
            <Text>Настройки для круговых диаграмм</Text>
            <View style={[
                styles.container,
                {
                    // Try setting `flexDirection` to `"row"`.
                    flexDirection: 'row',
                },
            ]}>
                <RadioButton
                    value="first"
                    status={ pieChecked === 'first' ? 'checked' : 'unchecked' }
                    onPress={() => setPieChecked('first')}
                />
                <Text>Без аггрегации</Text>
                <RadioButton
                    value="second"
                    status={ pieChecked === 'second' ? 'checked' : 'unchecked' }
                    onPress={() => setPieChecked('second')}
                />
                <Text>Суммирование</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 5,
    },
});
