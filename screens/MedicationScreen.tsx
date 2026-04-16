import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert, } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/config";
import { useAuth } from "../src/hooks/useAuth";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "../src/theme/ThemeContext";

type MedicationTime = {
  id: string;
  time: string;
};

type Medication = {
  id: string;
  name: string;
  dose: string;
  usage: string;
  notes: string;
  times: MedicationTime[];
};

//AsyncStorage nykyiselle päivälle
const getTodayCheckKey = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `med_checks_${yyyy}-${mm}-${dd}`;
};

const emptyForm = () => ({
  name: "",
  dose: "",
  usage: "",
  notes: "",
  times: [] as MedicationTime[],
  newTime: "",
});

//MedicationScreen
export default function MedicationScreen() {
  const { user } = useAuth();
  const { theme, styles } = useTheme();

  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  //Checkbox (tallennetaan tila myöhemmin AsyncStorageen)
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  // Lisää ja muokkaa lääkettä
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  //Firestore
  const loadMedications = useCallback(async () => {
    if (!user) return;
    try {
      const snap = await getDocs(
        collection(db, "users", user.uid, "medications")
      );
      const items: Medication[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Medication, "id">),
      }));
      setMedications(items);
    } catch (e) {
      console.error("Failed to load medications:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  //AsyncStoragesta checkboxin tila
  const loadChecks = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(getTodayCheckKey());
      if (raw) setChecks(JSON.parse(raw));
    } catch (e) {
      console.error("Failed to load check state:", e);
    }
  }, []);

  useEffect(() => {
    loadMedications();
    loadChecks();
  }, [loadMedications, loadChecks]);

  //Toggle päivittää checkboxin tilan AsyncStoragessa
  const toggleCheck = async (medId: string, timeId: string) => {
    const key = `${medId}_${timeId}`;
    const updated = { ...checks, [key]: !checks[key] };
    setChecks(updated);
    try {
      await AsyncStorage.setItem(getTodayCheckKey(), JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save check state:", e);
    }
  };

  //Lisää lääke
  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm());
    setModalVisible(true);
  };

  //Muokkaa lääkken tietoja
  const openEditModal = (med: Medication) => {
    setEditingId(med.id);
    setForm({
      name: med.name,
      dose: med.dose,
      usage: med.usage,
      notes: med.notes,
      times: med.times,
      newTime: "",
    });
    setModalVisible(true);
  };

  //Lisää kellonaika lomakkeeseen
  const addTimeToForm = () => {
    const t = form.newTime.trim();
    if (!/^\d{2}:\d{2}$/.test(t)) {
      Alert.alert("Invalid time", "Please enter a time in HH:MM format, e.g. 08:00");
      return;
    }
    const slot: MedicationTime = { id: Date.now().toString(), time: t };
    setForm((prev) => ({ ...prev, times: [...prev.times, slot], newTime: "" }));
  };

  const removeTimeFromForm = (id: string) => {
    setForm((prev) => ({
      ...prev,
      times: prev.times.filter((t) => t.id !== id),
    }));
  };

  //Tallennetaan muutokset (joko lisäys tai päivitys)
  const saveMedication = async () => {
    console.log("user at save time:", user?.uid);
    if (!user) return;
    if (!form.name.trim()) {
      Alert.alert("Required", "Medication name is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        dose: form.dose.trim(),
        usage: form.usage.trim(),
        notes: form.notes.trim(),
        times: form.times,
      };

      if (editingId) {
        await updateDoc(
          doc(db, "users", user.uid, "medications", editingId),
          payload
        );
        setMedications((prev) =>
          prev.map((m) => (m.id === editingId ? { ...m, ...payload } : m))
        );
      } else {
        const ref = await addDoc(
          collection(db, "users", user.uid, "medications"),
          { ...payload, createdAt: serverTimestamp() }
        );
        setMedications((prev) => [...prev, { id: ref.id, ...payload }]);
      }

      setModalVisible(false);
    } catch (e) {
      console.error("Failed to save medication:", e);
      Alert.alert("Error", "Could not save medication. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  //Poista lääkitäs
  const deleteMedication = (med: Medication) => {
    Alert.alert(
      "Delete medication",
      `Remove "${med.name}" from your list?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(
                doc(db, "users", user!.uid, "medications", med.id)
              );
              setMedications((prev) => prev.filter((m) => m.id !== med.id));
            } catch (e) {
              console.error("Failed to delete medication:", e);
              Alert.alert("Error", "Could not delete medication.");
            }
          },
        },
      ]
    );
  };

  //Ruutu
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#009FE3" />
      </View>
    );
  }

  return (
    <View style={[styles.med_root, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.med_scroll}
        contentContainerStyle={styles.med_scrollContent}
      >
        {/* Header */}
        <View style={styles.med_screenHeader}>
          <Text style={[styles.header, { color: theme.colors.text }]}>
            My Medications
          </Text>

          <TouchableOpacity style={styles.med_addButton} onPress={openAddModal}>
            <MaterialIcons name="add" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Empty state */}
        {medications.length === 0 && (
          <View style={styles.med_emptyBox}>
            <MaterialIcons name="medication" size={48} color="#009FE3" />
            <Text style={styles.med_emptyText}>No medications added yet.</Text>
            <Text style={styles.med_emptySubText}>
              Tap the + button to add your first medication.
            </Text>
          </View>
        )}

        {/* Medication cards */}
        {medications.map((med) => (
          <MedicationCard
            key={med.id}
            med={med}
            checks={checks}
            onToggleCheck={toggleCheck}
            onEdit={() => openEditModal(med)}
            onDelete={() => deleteMedication(med)}
          />
        ))}
      </ScrollView>

      {/* ADD / EDIT MEDICATION MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.med_modalBox}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editingId ? "Edit Medication" : "Add Medication"}
              </Text>

              <Text style={styles.med_fieldLabel}>Medication name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Paracetamol"
                value={form.name}
                onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
              />

              <Text style={styles.med_fieldLabel}>Dose</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 500mg, 2 tablets"
                value={form.dose}
                onChangeText={(v) => setForm((p) => ({ ...p, dose: v }))}
              />

              <Text style={styles.med_fieldLabel}>Usage</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. for blood pressure"
                value={form.usage}
                onChangeText={(v) => setForm((p) => ({ ...p, usage: v }))}
              />

              <Text style={styles.med_fieldLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.med_inputMultiline]}
                placeholder="e.g. take with food"
                value={form.notes}
                onChangeText={(v) => setForm((p) => ({ ...p, notes: v }))}
                multiline
                numberOfLines={3}
              />

              {/* Times */}
              <Text style={styles.med_fieldLabel}>Scheduled times</Text>

              {form.times.map((slot) => (
                <View key={slot.id} style={styles.med_timeChip}>
                  <MaterialIcons name="schedule" size={16} color="#009FE3" />
                  <Text style={styles.med_timeChipText}>{slot.time}</Text>
                  <TouchableOpacity onPress={() => removeTimeFromForm(slot.id)}>
                    <MaterialIcons name="close" size={18} color="#d11a2a" />
                  </TouchableOpacity>
                </View>
              ))}

              <View style={styles.med_timeRow}>
                <TextInput
                  style={[styles.input, styles.med_timeInput]}
                  placeholder="HH:MM"
                  value={form.newTime}
                  onChangeText={(v) => setForm((p) => ({ ...p, newTime: v }))}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
                <TouchableOpacity
                  style={styles.med_addTimeButton}
                  onPress={addTimeToForm}
                >
                  <MaterialIcons name="add" size={22} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Actions */}
              <View style={styles.med_modalActions}>
                <TouchableOpacity
                  style={styles.med_cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.med_cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.med_saveButton, saving && { opacity: 0.6 }]}
                  onPress={saveMedication}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.med_saveText}>
                      {editingId ? "Save changes" : "Add medication"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

//MedicationCard / Muokkaus alusta

type CardProps = {
  med: Medication;
  checks: Record<string, boolean>;
  onToggleCheck: (medId: string, timeId: string) => void;
  onEdit: () => void;
  onDelete: () => void;
};

function MedicationCard({ med, checks, onToggleCheck, onEdit, onDelete }: CardProps) {
  const { styles } = useTheme();

  return (
    <View style={styles.med_card}>

      {/* Header */}
      <View style={styles.med_cardHeader}>
        <View style={styles.med_cardTitleRow}>
          <MaterialIcons name="medication" size={20} color="#009FE3" />
          <Text style={styles.med_cardName}>{med.name}</Text>
        </View>

        <View style={styles.med_cardActions}>
          <TouchableOpacity onPress={onEdit} style={styles.med_iconButton}>
            <MaterialIcons name="edit" size={20} color="#4B5563" />
          </TouchableOpacity>

          <TouchableOpacity onPress={onDelete} style={styles.med_iconButton}>
            <MaterialIcons name="delete" size={20} color="#d11a2a" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dose */}
      {!!med.dose && (
        <View style={styles.med_infoRow}>
          <Text style={styles.med_infoLabel}>Dose</Text>
          <Text style={styles.med_infoValue}>{med.dose}</Text>
        </View>
      )}

      {/* Usage */}
      {!!med.usage && (
        <View style={styles.med_infoRow}>
          <Text style={styles.med_infoLabel}>Usage</Text>
          <Text style={styles.med_infoValue}>{med.usage}</Text>
        </View>
      )}

      {/* Notes */}
      {!!med.notes && (
        <View style={styles.med_notesRow}>
          <Text style={styles.med_infoLabel}>Notes</Text>
          <Text style={styles.med_notesValue}>{med.notes}</Text>
        </View>
      )}

      {med.times.length > 0 && <View style={styles.med_divider} />}

      {/* Times */}
      {med.times.length > 0 ? (
        <View>
          <Text style={styles.med_timesLabel}>Today's schedule</Text>

          {med.times.map((slot) => {
            const checkKey = `${med.id}_${slot.id}`;
            const checked = !!checks[checkKey];

            return (
              <TouchableOpacity
                key={slot.id}
                style={styles.med_timeSlotRow}
                onPress={() => onToggleCheck(med.id, slot.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.med_checkbox, checked && styles.med_checkboxChecked]}>
                  {checked && <MaterialIcons name="check" size={14} color="#fff" />}
                </View>

                <MaterialIcons
                  name="schedule"
                  size={16}
                  color={checked ? "#9CA3AF" : "#009FE3"}
                />

                <Text style={[styles.med_timeSlotText, checked && styles.med_timeSlotTextDone]}>
                  {slot.time}
                </Text>

                {checked && <Text style={styles.med_takenBadge}>Taken</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <Text style={styles.med_noTimesText}>
          No times scheduled — tap edit to add.
        </Text>
      )}
    </View>
  );
}