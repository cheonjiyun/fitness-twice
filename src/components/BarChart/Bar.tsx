import React from "react";
import { Dimensions, DimensionValue, StyleSheet, View } from "react-native";
import { theme } from "../../style/theme";

interface PropsType {
    height: number;
    weight: number;
}

export default function Bar({ height, weight }: PropsType) {
    return (
        <View style={styles(height, weight).container}>
            <View style={styles(height, weight).bar}></View>
        </View>
    );
}

const styles = (height: number, weight: number) =>
    StyleSheet.create({
        container: {
            height: height,
        },
        bar: {
            flexDirection: "column-reverse",
            width: 20,
            height: height * (weight || 0),
            backgroundColor: theme.color.primary[600],
        },
    });
