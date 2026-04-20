import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import TodayCarbsChart from "../components/TodaysCarbsGraph";
import { useTodayCarbsChart } from "../src/hooks/useTodayCarbsChart";

export default function Homescreen() {
  const { targetCarbs, remainingCarbs, totalCarbs } = useTodayCarbsChart();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerBox}>
        <Text style={styles.title}>GlugoMate</Text>
        <Text style={styles.subtitle}>Your daily diabetes overview</Text>
      </View>

      <View style={styles.chartBox}>
        <TodayCarbsChart />
      </View>

      {targetCarbs !== null && remainingCarbs !== null && (
        <View style={styles.summaryBox}>
          <Text style={styles.sectionTitle}>Today Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Consumed</Text>
              <Text style={styles.metricValue}>{totalCarbs.toFixed(0)} g</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Target</Text>
              <Text style={styles.metricValue}>{targetCarbs.toFixed(0)} g</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Remaining</Text>
              <Text style={[styles.metricValue, remainingCarbs < 0 ? styles.overTarget : styles.onTrack]}>
                {Math.abs(remainingCarbs).toFixed(0)} g
              </Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#E5F7FD",
  },
  container: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0D5C92",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#4C6572",
  },
  chartBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  summaryBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#113A5D",
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 12,
    color: "#6A7C89",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0D5C92",
  },
  metricDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#D9E4EC",
  },
  onTrack: {
    color: "#1D8A47",
  },
  overTarget: {
    color: "#C0392B",
  },
});
