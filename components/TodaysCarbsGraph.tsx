import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { useTodayCarbsChart } from "../src/hooks/useTodayCarbsChart";
import { globalStyles } from "../src/styles/globalStyles"

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
        <View style={globalStyles.todayChart_wrap}>
            <Text style={globalStyles.todayChart_title}>Today's Carbs</Text>

            <View style={globalStyles.todayChart_targetWrap}>
                {targetCarbs === null || remainingCarbs === null ? (
                    <Text style={globalStyles.todayChart_infoText}>
                        {targetMessage ??
                            "Missing profile info: add weight and height, or set a custom carb target."}
                    </Text>
                ) : (
                    <>
                        {totalCarbs > targetCarbs && (
                            <Text style={globalStyles.todayChart_warningText}>
                                You are {Math.abs(targetCarbs - totalCarbs).toFixed(1)} g above today&apos;s target.
                            </Text>
                        )}

                        <View style={globalStyles.todayChart_progressTrack}>
                            <View
                                style={[
                                    globalStyles.todayChart_progressFill,
                                    { width: `${progress * 100}%` },
                                ]}
                            />
                        </View>
                    </>
                )}
            </View>

            {loadingChart && <Text>Loading chart...</Text>}
            {!loadingChart && chartError && <Text style={globalStyles.todayChart_errorText}>{chartError}</Text>}
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

                    <Text style={globalStyles.todayChart_totalText}>
                        Total carbs: {totalCarbs.toFixed(1)} g
                    </Text>

                    {remainingCarbs !== null && (
                        <Text style={globalStyles.todayChart_remainingText}>
                            Remaining: {remainingCarbs.toFixed(1)} g
                        </Text>
                    )}
                </>
            )}

            {!loadingChart &&
                !chartError &&
                pieData.length === 0 &&
                remainingCarbs !== null && (
                    <Text style={globalStyles.todayChart_remainingText}>
                        Remaining: {remainingCarbs.toFixed(1)} g
                    </Text>
                )}
        </View>
    );
}