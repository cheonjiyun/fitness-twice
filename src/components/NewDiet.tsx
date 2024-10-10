import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import WheelPicker from "react-native-wheely";
import * as ImagePicker from "expo-image-picker";
import * as SQLite from "expo-sqlite";
import { HOURS, MINUTES } from "../constants/time";
import { conversionSqlDateTimeType } from "../util/date";
import { theme } from "../style/theme";
import HeaderDone from "./HeaderDone";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../App";
import { NEW_DIET } from "../constants/screenName";

type PropsType = StackScreenProps<RootStackParamList, typeof NEW_DIET>;

export default function NewDiet({ navigation }: PropsType) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const [dietNewSelectedHourIndex, setDietNewSelectedHourIndex] = useState(
        currentDate.getHours()
    );
    const [dietNewSelectedMinuteIndex, setDietNewSelectedMinuteIndex] = useState(
        currentDate.getMinutes()
    );
    const [dietNewSelectedImage, setDietNewSelectedImage] = useState<string | null>(null);

    // 완료버튼
    useEffect(() => {
        navigation.setOptions({
            headerRight: () => <HeaderDone onPress={() => saveDiet(dietNewSelectedImage)} />,
        });
    }, [dietNewSelectedImage]);

    // 사진선택
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            aspect: [1, 1],
        });

        if (!result.canceled) {
            setDietNewSelectedImage(result.assets[0].uri);
        }
    };

    // 식단 저장
    const saveDiet = async (dietNewSelectedImage: string | null) => {
        if (!dietNewSelectedImage) return;

        const db = await SQLite.openDatabaseAsync("fitness_twice");

        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS diet (id INTEGER PRIMARY KEY NOT NULL, date DATE, image TEXT);
            INSERT INTO diet (date, image) VALUES ('${conversionSqlDateTimeType(
                currentDate,
                dietNewSelectedHourIndex,
                dietNewSelectedMinuteIndex
            )}', '${dietNewSelectedImage}');`);

        navigation.goBack();
    };

    return (
        <View style={styles.dietNewContainer}>
            <View style={styles.dietNewSelectTimeContainer}>
                <WheelPicker
                    selectedIndex={dietNewSelectedHourIndex}
                    options={HOURS}
                    onChange={(index) => setDietNewSelectedHourIndex(index)}
                    visibleRest={1}
                    itemHeight={42}
                    containerStyle={styles.dietNewSelectTimeWheelContainer}
                    itemTextStyle={styles.dietNewSelectTimeWheelText}
                />
                <Text>:</Text>
                <WheelPicker
                    selectedIndex={dietNewSelectedMinuteIndex}
                    options={MINUTES}
                    onChange={(index) => setDietNewSelectedMinuteIndex(index)}
                    visibleRest={1}
                    itemHeight={42}
                    containerStyle={styles.dietNewSelectTimeWheelContainer}
                    itemTextStyle={styles.dietNewSelectTimeWheelText}
                />
            </View>
            <TouchableOpacity onPress={pickImage} style={styles.dietNewImageButton}>
                {dietNewSelectedImage ? (
                    <Image source={{ uri: dietNewSelectedImage }} style={styles.dietNewImage} />
                ) : (
                    <Text style={styles.dietNewImageButtonText}>사진선택</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    dietNewContainer: {
        // height: fullHeight,
        paddingTop: 40,
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
    },
    dietNewText: {
        marginTop: 16,
        marginBottom: 16,
        fontSize: 16,
        fontWeight: "600",
    },
    dietNewSelectsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    },
    dietNewSelectTimeContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    dietNewSelectTimeWheelText: {
        fontSize: 18,
    },
    dietNewSelectTimeWheelContainer: {
        marginHorizontal: 10,
    },
    dietNewImageButton: {
        justifyContent: "center",
        alignItems: "center",
        width: 100,
        height: 100,
        backgroundColor: theme.color.grey[400],
        borderRadius: 6,
    },
    dietNewImage: {
        width: 100,
        height: 100,
        padding: 10,
        borderRadius: 6,
    },
    dietNewImageButtonText: {
        fontSize: 16,
        color: theme.color.grey[900],
    },
    dietNewDoneButtonText: {
        padding: 14,
        margin: 20,

        paddingHorizontal: 34,

        fontSize: 16,
        color: theme.color.white,
        borderRadius: 6,
        backgroundColor: theme.color.primary[700],
    },
});
