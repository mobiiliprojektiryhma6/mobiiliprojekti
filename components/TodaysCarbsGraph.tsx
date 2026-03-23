import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";

type PieSlice = {
    name: string;
    carbs: number;
    color: string;
    legendFontColor: string;
    legendFontSize: number;
};

const COLORS = ["#009FE3", "#4CAF50", "#FF9800", "#E91E63", "#9C27B0", "#607D8B"];

export default function TodayCarbsChart() {
    const [loadingChart, setLoadingChart] = useState(false);
    const [chartError, setChartError] = useState<string | null>(null);
    const [pieData, setPieData] = useState<PieSlice[]>([]);
    const TARGET_CARBS = 1000;

    const chartWidth = useMemo(() => Math.min(Dimensions.get("window").width - 30, 420), []);
    const totalCarbs = useMemo(() => pieData.reduce((sum, item) => sum + item.carbs, 0), [pieData]);
    const progress = useMemo(() => Math.min(totalCarbs / TARGET_CARBS, 1), [totalCarbs]);
    const remainingCarbs = useMemo(() => Math.max(0, TARGET_CARBS - totalCarbs), [totalCarbs]);

    const loadTodayPieData = useCallback(async () => {
        try {
            setLoadingChart(true);
            setChartError(null);

            const uid = auth.currentUser?.uid;
            if (!uid) {
                setPieData([]);
                setChartError("No logged-in user found.");
                return;
            }

            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);

            const entriesRef = collection(db, "meals", uid, "entries");
            const q = query(
                entriesRef,
                where("timestamp", ">=", Timestamp.fromDate(startOfDay)),
                where("timestamp", "<", Timestamp.fromDate(endOfDay))
            );

            const snap = await getDocs(q);

            const mapped: PieSlice[] = snap.docs
                .map((doc, index) => {
                    const data = doc.data() as {
                        mealType?: string;
                        foods?: Array<{ carbohydrates?: number }>;
                    };

                    const carbs = (data.foods ?? []).reduce(
                        (sum, food) => sum + Number(food?.carbohydrates ?? 0),
                        0
                    );

                    return {
                        name: data.mealType?.trim() || `Meal ${index + 1}`,
                        carbs,
                        color: COLORS[index % COLORS.length],
                        legendFontColor: "#1F2937",
                        legendFontSize: 12,
                    };
                })
                .filter((item) => item.carbs > 0);

            setPieData(mapped);
        } catch (err: any) {
            setChartError(err?.message ?? "Failed to load chart data.");
            setPieData([]);
        } finally {
            setLoadingChart(false);
        }
    }, []);

    useEffect(() => {
        loadTodayPieData();
    }, [loadTodayPieData]);

    return (
        <View style={styles.chartWrap}>
            <Text style={styles.chartTitle}>Today's Carbs</Text>

            <View style={styles.targetWrap}>
                <Text style={styles.targetText}>
                    {totalCarbs.toFixed(1)} / {TARGET_CARBS} g ({remainingCarbs.toFixed(1)} g left)
                </Text>
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>
            </View>

            {loadingChart && <Text>Loading chart...</Text>}
            {!loadingChart && chartError && <Text style={styles.errorText}>{chartError}</Text>}
            {!loadingChart && !chartError && pieData.length === 0 && <Text>No carb data for today yet.</Text>}

            {!loadingChart && !chartError && pieData.length > 0 && (
                <>
                    <PieChart
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
                </>
            )}

            <TouchableOpacity style={styles.refreshButton} onPress={loadTodayPieData}>
                <Text style={styles.buttonText}>Refresh Chart</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    chartWrap: {
        marginTop: 14,
        marginBottom: 10,
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 10,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 8,
    },
    targetWrap: {
        width: "100%",
        marginBottom: 10,
        paddingHorizontal: 4,
    },
    targetText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#1F2937",
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
    errorText: {
        color: "#B00020",
        textAlign: "center",
    },
    refreshButton: {
        backgroundColor: "#009FE3",
        padding: 10,
        borderRadius: 8,
        marginTop: 8,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
});