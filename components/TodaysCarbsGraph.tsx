import React from "react";
import { View, Text } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { useTodayCarbsChart } from "../src/hooks/useTodayCarbsChart";
import { globalStyles } from "../src/styles/globalStyles";

export default function TodayCarbsChart() {
    const {
        chartError,
        chartKey,
        chartWidth,
        loadingChart,
        pieData,
    } = useTodayCarbsChart();

    return (
        <View style={globalStyles.todayChart_wrap}>
            {loadingChart && <Text>Loading chart...</Text>}

            {!loadingChart && chartError && (
                <Text style={globalStyles.todayChart_errorText}>{chartError}</Text>
            )}

            {!loadingChart && !chartError && pieData.length === 0 && (
                <Text style={globalStyles.textSecondary}>
                    No meals logged for today yet.
                </Text>
            )}

            {!loadingChart && !chartError && pieData.length > 0 && (
                <>
                    <Text style={globalStyles.todayChart_title}>Daily carbs per meal</Text>
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
