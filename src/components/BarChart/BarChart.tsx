import React from "react";
import { StyleSheet, View } from "react-native";
import Bar from "./Bar";

interface PropsType {
    height: number;
}

export default function BarChart({ height }: PropsType) {
    // const weights = [55.3, 54.3, 53.6, 54.0, 55.5, 53.8];
    const weightsPercentage = [0.8, 0, 0.2, 0.5, 1];

    return (
        <View style={styles.container}>
            {weightsPercentage.map((percentage, idx) => (
                <Bar height={height} weight={percentage} key={`${percentage} ${idx}`} />
            ))}
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        gap: 8,
    },
});
