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
import { MORNING, NIGHT } from "../constants/weight";

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

    // 날짜
    const goYesterday = () => {
        setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)));
    };

    const goTomorrow = () => {
        setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)));
    };

    // 몸무게
    const saveWeight = async (weightType: WeightType, weight: number) => {
        const db = await SQLite.openDatabaseAsync("fitness_twice");

        updateWeight(db, weightType, weight);
        const existingWeight = await getWeight(weightType);
        if (existingWeight) {
            updateWeight(db, weightType, weight);
        } else {
            insertWeight(db, weightType, weight);
        }
    };

    const insertWeight = async (
        db: SQLite.SQLiteDatabase,
        weightType: WeightType,
        weight: number
    ) => {
        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            
            CREATE TABLE IF NOT EXISTS weight (id INTEGER PRIMARY KEY NOT NULL, date DATE NOT NULL, type TEXT NOT NULL NOT NULL, weight INTEGER NOT NULL);
            INSERT INTO weight (date, type, weight) VALUES ('${conversionSqlDateType(
                currentDate
            )}', '${weightType}', ${weight});`);
    };

    const updateWeight = async (
        db: SQLite.SQLiteDatabase,
        weightType: WeightType,
        weight: number
    ) => {
        await db.execAsync(`
                PRAGMA journal_mode = WAL;
                
                UPDATE weight SET weight = ${weight} WHERE date = '${conversionSqlDateType(
            currentDate
        )}' AND type = '${weightType}';`);
    };

    const getWeight = async (weightType: WeightType): Promise<number | undefined> => {
        const db = await SQLite.openDatabaseAsync("fitness_twice");

        const currentDateTimeStart = conversionSqlDateType(currentDate);
        const currentDateTimeEnd = conversionSqlDateType(currentDate);
        const weight: Weights | null = await db.getFirstSync(
            `SELECT weight FROM weight WHERE type = '${weightType}' AND date BETWEEN '${currentDateTimeStart}' AND '${currentDateTimeEnd}'`
        );

        return weight?.weight;
    };

    const getAndSetWeight = async () => {
        const morning = await getWeight(MORNING);
        const night = await getWeight(NIGHT);

        setWeightMorning(morning?.toString() || "");
        setWeightNight(night?.toString() || "");
    };

    // 소수점 두자리면 짜르기
    const checkFixedOne = (weight: Number) => {
        return !(+weight.toFixed(1) === weight);
    };

    useEffect(() => {
        getAndSetWeight();
    }, [currentDate]);

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
    }, [isFocused, currentDate]);

    return (
        <View>
            <ScrollView style={styles.contianer}>
                <View style={styles.top}>
                    <TouchableOpacity onPress={goYesterday} style={styles.arrowImageContainer}>
                        <Image
                            source={require("../../assets/icons/arrow-left.png")}
                            style={styles.arrowImage}
                        />
                    </TouchableOpacity>

                    <Text>
                        {currentDate.getFullYear()}.
                        {(currentDate.getMonth() + 1).toString().padStart(2, "0")}.
                        {currentDate.getDate().toString().padStart(2, "0")}
                    </Text>
                    <TouchableOpacity onPress={goTomorrow} style={styles.arrowImageContainer}>
                        <Image
                            source={require("../../assets/icons/arrow-right.png")}
                            style={styles.arrowImage}
                        />
                    </TouchableOpacity>
                </View>
                {/* -- 몸무게 -- */}
                <View>
                    <View style={styles.weightEach}>
                        <Text>아침</Text>
                        <View style={styles.weightInputContainer}>
                            <TextInput
                                value={weightMorining}
                                onChangeText={(text) => {
                                    if (checkFixedOne(Number(text))) return;
                                    setWeightMorning(text);
                                }}
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
                                onChangeText={(text) => {
                                    if (checkFixedOne(Number(text))) return;
                                    setWeightNight(text);
                                }}
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
        alignItems: "center",
        marginTop: 4,
        marginBottom: 10,
        marginHorizontal: 10,
    },
    arrowImageContainer: {
        justifyContent: "center",
        alignItems: "center",
        width: 36,
        height: 36,
    },
    arrowImage: {
        width: 25,
        height: 25,
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
