import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { resolveDailyCarbTarget } from "../utils/carbTarget";
import { getChartWidth, getDayKey, mapMealsToPieSlices } from "../utils/todaysCarbsChart";
import { MealEntryData, PieSlice } from "../../types/TodayCarbsChart";

const AUTO_REFRESH_MS = 30_000;

export const useTodayCarbsChart = () => {
    const [loadingChart, setLoadingChart] = useState(false);
    const [chartError, setChartError] = useState<string | null>(null);
    const [pieData, setPieData] = useState<PieSlice[]>([]);
    const [targetCarbs, setTargetCarbs] = useState<number | null>(null);
    const [targetMessage, setTargetMessage] = useState<string | null>(null);

    const dayKeyRef = useRef(getDayKey());
    const chartWidth = useMemo(() => getChartWidth(), []);

    const totalCarbs = useMemo(() => pieData.reduce((sum, item) => sum + item.carbs, 0), [pieData]);

    const progress = useMemo(() => {
        if (!targetCarbs || targetCarbs <= 0) return 0;
        return Math.min(totalCarbs / targetCarbs, 1);
    }, [targetCarbs, totalCarbs]);

    const remainingCarbs = useMemo(() => {
        if (!targetCarbs || targetCarbs <= 0) return null;
        return Math.max(0, targetCarbs - totalCarbs);
    }, [targetCarbs, totalCarbs]);

    const chartKey = useMemo(() => {
        const sig = pieData.map((slice) => `${slice.name}:${slice.carbs}`).join("|");
        return `${dayKeyRef.current}-${sig}-${totalCarbs}`;
    }, [pieData, totalCarbs]);

    const loadTodayPieData = useCallback(async () => {
        try {
            setLoadingChart(true);
            setChartError(null);

            const uid = auth.currentUser?.uid;
            if (!uid) {
                setPieData([]);
                setChartError("No logged-in user found.");
                setTargetCarbs(null);
                setTargetMessage("No logged-in user found.");
                return;
            }

            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.exists() ? userSnap.data() : {};

            const resolvedTarget = resolveDailyCarbTarget({
                useManualCarbTarget: userData?.useManualCarbTarget,
                dailyCarbTarget: userData?.dailyCarbTarget,
                weight: userData?.weight,
                height: userData?.height,
            });

            setTargetCarbs(resolvedTarget.target);
            setTargetMessage(resolvedTarget.reason ?? null);

            const todayKey = getDayKey();
            const entriesRef = collection(db, "meals", uid, "entries");
            const q = query(entriesRef, where("dateString", "==", todayKey));
            const snap = await getDocs(q);

            const meals = snap.docs.map((entryDoc) => entryDoc.data() as MealEntryData);
            setPieData(mapMealsToPieSlices(meals));
        } catch (err: any) {
            setChartError(err?.message ?? "Failed to load chart data.");
            setPieData([]);
            setTargetCarbs(null);
            setTargetMessage("Failed to load carb target.");
        } finally {
            setLoadingChart(false);
        }
    }, []);

    useEffect(() => {
        loadTodayPieData();
    }, [loadTodayPieData]);

    useFocusEffect(
        useCallback(() => {
            loadTodayPieData();
        }, [loadTodayPieData])
    );

    useEffect(() => {
        const appStateSub = AppState.addEventListener("change", (state) => {
            if (state !== "active") return;

            const nowKey = getDayKey();
            if (nowKey !== dayKeyRef.current) {
                dayKeyRef.current = nowKey;
                setPieData([]);
            }

            loadTodayPieData();
        });

        const interval = setInterval(() => {
            const nowKey = getDayKey();
            if (nowKey !== dayKeyRef.current) {
                dayKeyRef.current = nowKey;
                setPieData([]);
            }

            loadTodayPieData();
        }, AUTO_REFRESH_MS);

        return () => {
            appStateSub.remove();
            clearInterval(interval);
        };
    }, [loadTodayPieData]);

    return {
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
    };
};