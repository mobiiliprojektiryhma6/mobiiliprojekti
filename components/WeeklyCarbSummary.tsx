import React from "react";
import { View, Text, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

type CarbEntry = {
    date: string;
    carbs: number;
};

type Props = {
    data: CarbEntry[];
};

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getWeekdayTotals(entries: CarbEntry[]) {
    const totals = [0, 0, 0, 0, 0, 0, 0];

    entries.forEach((entry) => {
        const [year, month, day] = entry.date.split("-").map(Number);
        const d = new Date(year, month - 1, day);
        const weekday = (d.getDay() + 6) % 7;
        totals[weekday] += entry.carbs;
    });

    return totals;
}

function computeLeastSquares(values: number[]) {
    const n = values.length;
    const x = values.map((_, i) => i + 1);
    const y = values;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
}

export default function WeeklyCarbSummary({ data }: Props) {
    const totals = getWeekdayTotals(data);
    const { slope, intercept } = computeLeastSquares(totals);
    const trend = totals.map((_, i) => slope * (i + 1) + intercept);

    return (
        <View style={{ marginTop: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 10 }}>
                Weekly Carb Summary
            </Text>

            {/* Y-axis label */}
            <Text style={{ textAlign: "center", marginBottom: 4, color: "#555" }}>
                Carbs (g)
            </Text>

            <LineChart
                data={{
                    labels: weekdays,
                    datasets: [
                        {
                            data: totals,
                            color: () => "#4CAF50", // green
                            strokeWidth: 2,
                        },
                        {
                            data: trend,
                            color: () => "#FF9800", // orange
                            strokeWidth: 2,
                        },
                    ],
                }}
                width={Dimensions.get("window").width - 32}
                height={260}
                chartConfig={{
                    backgroundColor: "#ffffff",
                    backgroundGradientFrom: "#ffffff",
                    backgroundGradientTo: "#ffffff",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                    labelColor: () => "#333",
                }}
                bezier={false}
                style={{
                    borderRadius: 12,
                }}
            />

            {/* Custom Legend */}
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    marginTop: 10,
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginRight: 16,
                    }}
                >
                    <View
                        style={{
                            width: 12,
                            height: 12,
                            backgroundColor: "#4CAF50",
                            marginRight: 6,
                        }}
                    />
                    <Text>Daily carbs</Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                        style={{
                            width: 12,
                            height: 12,
                            backgroundColor: "#FF9800",
                            marginRight: 6,
                        }}
                    />
                    <Text>Trendline</Text>
                </View>
            </View>
        </View>
    );
}
