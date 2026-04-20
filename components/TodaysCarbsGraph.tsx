import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { useTodayCarbsChart } from "../src/hooks/useTodayCarbsChart";

export default function TodayCarbsChart() {
    const {
        chartError,
        chartKey,
        chartWidth,
        loadingChart,
        pieData,
    } = useTodayCarbsChart();

    return (
        <View style={styles.chartWrap}>
            {loadingChart && <Text>Loading chart...</Text>}
            {!loadingChart && chartError && <Text style={styles.errorText}>{chartError}</Text>}
            {!loadingChart && !chartError && pieData.length === 0 && <Text>No meals logged for today yet.</Text>}

            {!loadingChart && !chartError && pieData.length > 0 && (
                <>
                    <PieChart
                        key={chartKey}
                        data={pieData}
                        width={chartWidth}
                        height={200}
                        accessor="carbs"
                        backgroundColor="transparent"
                        paddingLeft="10"
                        hasLegend
                        chartConfig={{ color: () => "#000" }}
                        absolute
                    />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    chartWrap: {
        marginTop: 0,
        marginBottom: 16,
        alignItems: "center",
        paddingVertical: 0,
        paddingHorizontal: 10,
    },
    errorText: {
        color: "#B00020",
        textAlign: "center",
    },
});