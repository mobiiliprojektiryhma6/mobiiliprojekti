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
        progress,
        remainingCarbs,
        targetCarbs,
        targetMessage,
        totalCarbs,
    } = useTodayCarbsChart();

    return (
        <View style={styles.chartWrap}>
            <Text style={styles.chartTitle}>Today's Carbs</Text>

            <View style={styles.targetWrap}>
                {targetCarbs === null || remainingCarbs === null ? (
                    <Text style={styles.infoText}>{targetMessage ?? "Missing profile info: add weight and height, or set a custom carb target."}</Text>
                ) : (
                    <>
                        {totalCarbs > targetCarbs && (
                            <Text style={styles.warningText}>You are {Math.abs(targetCarbs - totalCarbs).toFixed(1)} g above today&apos;s target.</Text>
                        )}

                        <View style={styles.progressTrack}>
                            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                        </View>
                    </>
                )}
            </View>

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
                    <Text style={styles.totalText}>Total carbs: {totalCarbs.toFixed(1)} g</Text>
                    {remainingCarbs !== null && <Text style={styles.remainingText}>Remaining: {remainingCarbs.toFixed(1)} g</Text>}
                </>
            )}

            {!loadingChart && !chartError && pieData.length === 0 && remainingCarbs !== null && (
                <Text style={styles.remainingText}>Remaining: {remainingCarbs.toFixed(1)} g</Text>
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
    chartTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 8,
    },
    targetWrap: {
        width: "100%",
        marginBottom: 6,
        paddingHorizontal: 4,
    },
    infoText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#B00020",
        marginBottom: 6,
    },
    warningText: {
        fontSize: 12,
        color: "#B00020",
        marginBottom: 6,
    },
    progressTrack: {
        width: "100%",
        height: 8,
        borderRadius: 999,
        backgroundColor: "#E5E7EB",
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#009FE3",
    },
    totalText: {
        marginTop: 8,
        fontWeight: "600",
    },
    remainingText: {
        marginTop: 4,
        fontSize: 14,
        fontWeight: "600",
        color: "#1F2937",
    },
    errorText: {
        color: "#B00020",
        textAlign: "center",
    },
});