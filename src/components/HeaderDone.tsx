import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { theme } from "../style/theme";

interface PropsType {
    onPress: () => {};
}

export default function HeaderDone({ onPress }: PropsType) {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <Text style={styles.text}>완료</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 22,
        paddingVertical: 8,
    },

    text: {
        color: theme.color.black,
    },
});
