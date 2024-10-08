import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import * as SQLite from "expo-sqlite";
import { conversionSqlDateType } from "../util/date";

export default function Today() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const saveWeight = async (weightType: WeightType, weight: number) => {
        const db = await SQLite.openDatabaseAsync("fitness_twice");

        const newWeight = weight.toFixed(1);

        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS weight (id INTEGER PRIMARY KEY NOT NULL, date DATE, type TEXT NOT NULL, weight INTEGER);
            INSERT INTO weight (date, type, weight) VALUES ('${conversionSqlDateType(
                currentDate
            )}', '${weightType}', ${newWeight});`);
    };

    return (
        <View>
            <View style={style.top}>
                <Text>어제</Text>
                <Text>2024.10.08</Text>
                <Text>내일</Text>
            </View>

            <View>
                <View style={style.weightEach}>
                    <Text>아침</Text>
                    <View style={style.weightInputContainer}>
                        <TextInput
                            placeholder="00.0"
                            keyboardType="number-pad"
                            onSubmitEditing={(e) =>
                                saveWeight("MORNING", Number(e.nativeEvent.text))
                            }
                        />
                        <Text>kg</Text>
                    </View>
                </View>
                <View style={style.weightEach}>
                    <Text>저녁</Text>
                    <View style={style.weightInputContainer}>
                        <TextInput
                            placeholder="00.0"
                            keyboardType="number-pad"
                            onSubmitEditing={(e) => saveWeight("NIGHT", Number(e.nativeEvent.text))}
                        />
                        <Text>kg</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const style = StyleSheet.create({
    top: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10,
        marginBottom: 10,
    },
    weightEach: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10,
        margin: 10,
    },
    weightInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
});
