import React from "react";
import { View } from "react-native";
import { PieChart } from "react-native-svg-charts";
import { G, Text as SvgTextRaw } from "react-native-svg";

const SvgText = SvgTextRaw as any;

type Props = {
    carbs: number;
    protein: number;
    fat: number;
    calories: number;
};

export default function NutritionCircle({ carbs, protein, fat, calories }: Props) {

    const data = [
        { key: 1, value: carbs, svg: { fill: "#E67E22" } },
        { key: 2, value: protein, svg: { fill: "#2980B9" } },
        { key: 3, value: fat, svg: { fill: "#27AE60" } },
    ];

    const Labels = () => (
        <G {...({} as any)}>
            <SvgText
                x="50%"
                y="45%"
                textAnchor="middle"
                alignmentBaseline="middle"
                fontSize={18}
                fontWeight="bold"
            >
                {calories}
            </SvgText>

            <SvgText
                x="50%"
                y="60%"
                textAnchor="middle"
                alignmentBaseline="middle"
                fontSize={12}
                fill="#777"
            >
                kcal
            </SvgText>
        </G>
    );

    return (
        <View style={{ alignItems: "center", marginVertical: 10 }}>
            <PieChart
                style={{ height: 140, width: 140 }}
                valueAccessor={({ item }: { item: any }) => item.value}
                data={data}
                outerRadius={"95%"}
                innerRadius={"70%"}
            >
                <Labels />
            </PieChart>
        </View>
    );
}