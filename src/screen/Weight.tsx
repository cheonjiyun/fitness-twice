import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as SQLite from "expo-sqlite";
import { conversionSqlDateType } from "../util/date";
import { Weights } from "../type/weight";
import {
    LineChart,
    BarChart,
    PieChart,
    ProgressChart,
    ContributionGraph,
    StackedBarChart,
} from "react-native-chart-kit";
import { theme } from "../style/theme";

const ONDAY = 1000 * 60 * 60 * 24;

export default function Weight() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentWeights, setCurrentWeights] = useState<Weights[]>([]);

    const getMonday = (date: Date): Date => {
        const MODAY = 1;
        const minusDate = date.getDay() == 0 ? 6 : date.getDay() - MODAY; // 가장가까운 월요일까지 며칠을 뺴야하는지
        return new Date(Number(date) - minusDate * ONDAY);
    };

    const getWeightWeek = async (): Promise<Weights[] | null> => {
        const db = await SQLite.openDatabaseAsync("fitness_twice");

        const currentMonday = getMonday(currentDate);
        const weekStart = conversionSqlDateType(currentMonday);
        const weekEnd = conversionSqlDateType(new Date(Number(currentMonday) + ONDAY * 7));
        const weight: Weights[] | null = await db.getAllSync(
            `SELECT weight FROM weight WHERE date BETWEEN '${weekStart}' AND '${weekEnd}'`
        );

        return weight;
    };

    useEffect(() => {
        (async () => {
            const weights = await getWeightWeek();
            setCurrentWeights(weights || []);
        })();
    }, [currentDate]);

    return (
        <View style={styles.container}>
            <View style={styles.top}>
                <Text>저번주</Text>
                <Text>이번주</Text>
                <Text>다음주</Text>
            </View>
            <View>
                <Text>평균</Text>
                <Text>저번주보다 -5kg</Text>
            </View>
            <TouchableOpacity>
                <Text>아침만 보기</Text>
            </TouchableOpacity>
            <TouchableOpacity>
                <Text>저녁만 보기</Text>
            </TouchableOpacity>
            {/* {currentWeights.map((weight, idx) => (
                <View key={`${weight.date} ${idx}`}>
                    <Text>{weight.weight}</Text>
                </View>
            ))} */}

            <LineChart
                data={{
                    labels: ["월", "화", "수", "목", "금", "토", "일"],
                    datasets: [
                        {
                            data: [54.4, 54.6, 55.3, 53.3, 52.1, 52.6],
                        },
                        {
                            data: [54.6, 55.6, 55.5, 53.1, 52.3, 52.9],
                        },
                    ],
                }}
                width={Dimensions.get("window").width} // from react-native
                height={300}
                yAxisSuffix="kg"
                chartConfig={{
                    backgroundColor: theme.color.primary[100],
                    backgroundGradientFrom: theme.color.grey[100],
                    backgroundGradientTo: theme.color.grey[100],
                    decimalPlaces: 1, // optional, defaults to 2dp

                    color: (opacity = 1) => theme.color.primary[600],
                    // color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                        borderRadius: 16,
                    },
                    propsForDots: {
                        r: "5",
                        strokeWidth: "0",
                        stroke: theme.color.primary[700],
                    },
                }}
                segments={6}
                yLabelsOffset={20}
                xLabelsOffset={10}
                withInnerLines={false}
                withOuterLines={false}
                bezier
                style={{
                    marginVertical: 8,
                    borderRadius: 16,
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 10,
    },
    top: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 4,
        marginBottom: 10,
        marginHorizontal: 10,
    },
});
