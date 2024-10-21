import React, { useEffect, useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import * as SQLite from "expo-sqlite";

import {
    conversionSqlDateTimeType,
    conversionSqlDateType,
    getTimeFromSqlDateTime,
} from "../util/date";
import { theme } from "../style/theme";
import { StackScreenProps } from "@react-navigation/stack";
import { NEW_DIET, TODAY } from "../constants/screenName";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { RootTabParamList } from "../components/Tabs";
import { CompositeScreenProps, useIsFocused } from "@react-navigation/native";
import { RootStackParamList } from "../../App";
import { DietListType } from "../type/diet";
import { Pedometer } from "expo-sensors";
import { Subscription } from "expo-sensors/build/Pedometer";
import { Weights, WeightType } from "../type/weight";

type PropsType = CompositeScreenProps<
    BottomTabScreenProps<RootTabParamList, typeof TODAY>,
    StackScreenProps<RootStackParamList>
>;

export default function Today({ navigation }: PropsType) {
    const isFocused = useIsFocused();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentStepCount, setCurrentStepCount] = useState(0);
    const [weightMorining, setWeightMorning] = useState("");
    const [weightNight, setWeightNight] = useState("");
    const [dietList, setDietList] = useState<DietListType>([]);

    // 몸무게
    const saveWeight = async (weightType: WeightType, weight: number) => {
        const db = await SQLite.openDatabaseAsync("fitness_twice");

        const newWeight = weight.toFixed(1);

        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            
            CREATE TABLE IF NOT EXISTS weight (id INTEGER PRIMARY KEY NOT NULL, date DATE NOT NULL, type TEXT NOT NULL NOT NULL, weight INTEGER NOT NULL);
            INSERT INTO weight (date, type, weight) VALUES ('${conversionSqlDateType(
                currentDate
            )}', '${weightType}', ${newWeight});`);
    };

    const getWeight = async () => {
        const db = await SQLite.openDatabaseAsync("fitness_twice");

        const currentDateTimeStart = conversionSqlDateType(currentDate);
        const currentDateTimeEnd = conversionSqlDateType(currentDate);
        const weightRows: Weights[] = await db.getAllAsync(
            `SELECT * FROM weight WHERE date BETWEEN '${currentDateTimeStart}' AND '${currentDateTimeEnd}'`
        );

        setWeightMorning(
            weightRows.find((weight) => weight.type == "MORNING")?.weight.toString() || ""
        );
        setWeightNight(
            weightRows.find((weight) => weight.type == "NIGHT")?.weight.toString() || ""
        );
    };

    useEffect(() => {
        getWeight();
    }, []);

    // 걸음수
    const pedometer = async (): Promise<Subscription | undefined> => {
        await Pedometer.requestPermissionsAsync(); // 권한
        const permisionStatus = await Pedometer.getPermissionsAsync();

        const isAvailable = await Pedometer.isAvailableAsync();

        if (isAvailable && permisionStatus) {
            return Pedometer.watchStepCount((result) => {
                setCurrentStepCount(result.steps);
            });
        }
    };
    useEffect(() => {
        let subscription: Subscription | undefined;
        (async () => {
            subscription = await pedometer();
        })();

        return () => subscription && subscription.remove();
    }, []);

    // 식단 목록
    const refreshDietList = async () => {
        const db = await SQLite.openDatabaseAsync("fitness_twice");

        const currentDateTimeStart = conversionSqlDateTimeType(currentDate, 0, 0);
        const currentDateTimeEnd = conversionSqlDateTimeType(currentDate, 23, 59);
        const dietRows: DietListType = await db.getAllAsync(
            `SELECT * FROM diet WHERE date BETWEEN '${currentDateTimeStart}' AND '${currentDateTimeEnd}' ORDER BY date ASC`
        );
        setDietList(dietRows);
    };

    // 이 화면에 fouce될때마다 데이터를 새롭게 불러옴
    useEffect(() => {
        refreshDietList();
    }, [isFocused]);

    return (
        <View>
            <ScrollView style={styles.contianer}>
                <View style={styles.top}>
                    <Text>어제</Text>
                    <Text>2024.10.08</Text>
                    <Text>내일</Text>
                </View>
                {/* -- 몸무게 -- */}
                <View>
                    <View style={styles.weightEach}>
                        <Text>아침</Text>
                        <View style={styles.weightInputContainer}>
                            <TextInput
                                value={weightMorining}
                                onChangeText={(text) => setWeightMorning(text)}
                                placeholder="00.0"
                                keyboardType="number-pad"
                                onSubmitEditing={(e) =>
                                    saveWeight("MORNING", Number(e.nativeEvent.text))
                                }
                            />
                            <Text>kg</Text>
                        </View>
                    </View>
                    <View style={styles.weightEach}>
                        <Text>저녁</Text>
                        <View style={styles.weightInputContainer}>
                            <TextInput
                                value={weightNight}
                                onChangeText={(text) => setWeightNight(text)}
                                placeholder="00.0"
                                keyboardType="number-pad"
                                onSubmitEditing={(e) =>
                                    saveWeight("NIGHT", Number(e.nativeEvent.text))
                                }
                            />
                            <Text>kg</Text>
                        </View>
                    </View>
                </View>

                {/* -- 걸음수 -- */}
                <View style={styles.pedometerContainer}>
                    <Text>걸음수</Text>
                    <Text>{currentStepCount}</Text>
                </View>

                {/* -- 식단 -- */}
                <View style={styles.dietContainer}>
                    <View style={styles.dietList}>
                        {dietList.map((dietItem) => (
                            <View style={styles.dietItem} key={dietItem.id}>
                                <Text style={styles.dietTimeTime}>
                                    {getTimeFromSqlDateTime(dietItem.date)}
                                </Text>
                                {dietItem.image && (
                                    <Image
                                        source={{ uri: dietItem.image }}
                                        style={styles.dietImage}
                                    />
                                )}
                            </View>
                        ))}
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.navigate(NEW_DIET)}
                        style={styles.dietNewButtonContainer}
                    >
                        <Text style={styles.dietNewButtonText}>새 식단 추가하기</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    contianer: {
        margin: 8,
    },
    top: {
        flexDirection: "row",
        justifyContent: "space-between",
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
    pedometerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: theme.color.grey[400],
        borderStyle: "solid",
    },
    dietContainer: {
        borderTopWidth: 1,
        borderTopColor: theme.color.grey[400],
        borderStyle: "solid",
    },
    dietList: {
        gap: 2,
    },
    dietItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
    },
    dietTimeTime: {
        paddingLeft: 20,
    },
    dietImage: {
        width: 100,
        height: 100,
        padding: 10,
        borderRadius: 6,
    },
    dietNewButtonContainer: {
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderRadius: 6,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: theme.color.primary[700],
        backgroundColor: theme.color.white,
    },
    dietNewButtonText: {
        textAlign: "center",
        fontSize: 16,
        fontWeight: "600",
        color: theme.color.primary[700],
    },
});
