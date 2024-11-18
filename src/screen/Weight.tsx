import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import * as SQLite from "expo-sqlite";
import { conversionSqlDateType } from "../util/date";
import { Weights } from "../type/weight";

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
            {currentWeights.map((weight, idx) => (
                <View key={`${weight.date} ${idx}`}>
                    <Text>{weight.weight}</Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 10,
    },
});
