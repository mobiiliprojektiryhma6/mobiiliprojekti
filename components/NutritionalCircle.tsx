import React from "react";
import { View } from "react-native";
import Svg, { G, Circle, Text as SvgText } from "react-native-svg";

type Props = {
    carbs: number;
    protein: number;
    fat: number;
    calories: number;
};

export default function NutritionCircle({ carbs, protein, fat, calories }: Props) {
    const size = 140;
    const strokeWidth = 18;
    const radius = (size - strokeWidth) / 2;
    const cx = size / 2;
    const cy = size / 2;
    const circumference = 2 * Math.PI * radius;

    const total = carbs + protein + fat;

    const segments =
        total > 0
            ? [
                  { value: carbs, color: "#E67E22" },
                  { value: protein, color: "#2980B9" },
                  { value: fat, color: "#27AE60" },
              ]
            : [{ value: 1, color: "#EEEEEE" }];

    const segTotal = segments.reduce((s, x) => s + x.value, 0);

    let offset = 0;
    const arcs = segments.map((seg, i) => {
        const fraction = seg.value / segTotal;
        const dash = fraction * circumference;
        const gap = circumference - dash;
        const circle = (
            <Circle
                key={i}
                cx={cx}
                cy={cy}
                r={radius}
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offset}
                fill="none"
            />
        );
        offset += dash;
        return circle;
    });

    return (
        <View style={{ alignItems: "center", marginVertical: 10 }}>
            <Svg width={size} height={size}>
                {/* Rotate -90deg so the first slice starts at the top */}
                <G rotation={-90} origin={`${cx}, ${cy}`}>
                    {arcs}
                </G>
                <SvgText
                    x={cx}
                    y={cy - 2}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fontSize={18}
                    fontWeight="bold"
                    fill="#1A1A2E"
                >
                    {calories}
                </SvgText>
                <SvgText
                    x={cx}
                    y={cy + 16}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fontSize={12}
                    fill="#777"
                >
                    kcal
                </SvgText>
            </Svg>
        </View>
    );
}
