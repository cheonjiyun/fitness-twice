import React from "react";
import { StyleSheet, View } from "react-native";
import { theme } from "../style/theme";

interface PropsType {
    height: Number;
}

export default function Bar({ height }: PropsType) {
    return <View style={styles.bar}>Bar</View>;
}

const styles = StyleSheet.create({
    bar: {
        height: 100,
        backgroundColor: theme.color.primary[600],
    },
});
