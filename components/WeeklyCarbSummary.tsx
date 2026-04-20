import React from "react";
import { View, Text, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

type CarbEntry = {
    date: string;
    carbs: number;
};

type Props = {
    data: CarbEntry[];
    comparisonData?: CarbEntry[];
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

export default function WeeklyCarbSummary({ data, comparisonData = [] }: Props) {
    const totals = getWeekdayTotals(data);
    const lastWeekTotals = getWeekdayTotals(comparisonData);

    return (
        <View style={{ marginTop: 8 }}>

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
                            data: lastWeekTotals,
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
                    <Text>Last week (same day)</Text>
                </View>
            </View>
        </View>
    );
}
