import React, { useState, useEffect, useCallback } from "react";
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../src/hooks/useAuth";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";


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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#009FE3" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>My Medications</Text>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <MaterialIcons name="add" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        {medications.length === 0 && (
          <View style={styles.emptyBox}>
            <MaterialIcons name="medication" size={48} color="#009FE3" />
            <Text style={styles.emptyText}>No medications added yet.</Text>
            <Text style={styles.emptySubText}>
              Tap the + button to add your first medication.
            </Text>
          </View>
        )}

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

      {/* Lisäys/muokkaus */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editingId ? "Edit Medication" : "Add Medication"}
              </Text>

              <Text style={styles.fieldLabel}>Medication name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Paracetamol"
                value={form.name}
                onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
              />

              <Text style={styles.fieldLabel}>Dose</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 500mg, 2 tablets"
                value={form.dose}
                onChangeText={(v) => setForm((p) => ({ ...p, dose: v }))}
              />

              <Text style={styles.fieldLabel}>Usage</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. for blood pressure"
                value={form.usage}
                onChangeText={(v) => setForm((p) => ({ ...p, usage: v }))}
              />

              <Text style={styles.fieldLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="e.g. take with food"
                value={form.notes}
                onChangeText={(v) => setForm((p) => ({ ...p, notes: v }))}
                multiline
                numberOfLines={3}
              />

              {/* Aika */}
              <Text style={styles.fieldLabel}>Scheduled times</Text>

              {form.times.map((slot) => (
                <View key={slot.id} style={styles.timeChip}>
                  <MaterialIcons name="schedule" size={16} color="#009FE3" />
                  <Text style={styles.timeChipText}>{slot.time}</Text>
                  <TouchableOpacity onPress={() => removeTimeFromForm(slot.id)}>
                    <MaterialIcons name="close" size={18} color="#d11a2a" />
                  </TouchableOpacity>
                </View>
              ))}

              <View style={styles.timeRow}>
                <TextInput
                  style={[styles.input, styles.timeInput]}
                  placeholder="HH:MM"
                  value={form.newTime}
                  onChangeText={(v) => setForm((p) => ({ ...p, newTime: v }))}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
                <TouchableOpacity style={styles.addTimeButton} onPress={addTimeToForm}>
                  <MaterialIcons name="add" size={22} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Toiminnot */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveButton, saving && { opacity: 0.6 }]}
                  onPress={saveMedication}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.saveText}>
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
  return (
    <View style={styles.card}>

      {/* Otsikko ja toiminnot */}
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <MaterialIcons name="medication" size={20} color="#009FE3" />
          <Text style={styles.cardName}>{med.name}</Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={onEdit} style={styles.iconButton}>
            <MaterialIcons name="edit" size={20} color="#4B5563" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.iconButton}>
            <MaterialIcons name="delete" size={20} color="#d11a2a" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dose/Annos */}
      {!!med.dose && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Dose</Text>
          <Text style={styles.infoValue}>{med.dose}</Text>
        </View>
      )}

      {/* Usage/Käyttö */}
      {!!med.usage && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Usage</Text>
          <Text style={styles.infoValue}>{med.usage}</Text>
        </View>
      )}

      {/* Notes/Huomioitavaa */}
      {!!med.notes && (
        <View style={styles.notesRow}>
          <Text style={styles.infoLabel}>Notes</Text>
          <Text style={styles.notesValue}>{med.notes}</Text>
        </View>
      )}

      {med.times.length > 0 && <View style={styles.divider} />}

      {/* Time & Checkboxes / Ajat ja checkboxit */}
      {med.times.length > 0 && (
        <View>
          <Text style={styles.timesLabel}>Today's schedule</Text>
          {med.times.map((slot) => {
            const checkKey = `${med.id}_${slot.id}`;
            const checked = !!checks[checkKey];
            return (
              <TouchableOpacity
                key={slot.id}
                style={styles.timeSlotRow}
                onPress={() => onToggleCheck(med.id, slot.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                  {checked && (
                    <MaterialIcons name="check" size={14} color="#fff" />
                  )}
                </View>
                <MaterialIcons
                  name="schedule"
                  size={16}
                  color={checked ? "#9CA3AF" : "#009FE3"}
                />
                <Text style={[styles.timeSlotText, checked && styles.timeSlotTextDone]}>
                  {slot.time}
                </Text>
                {checked && (
                  <Text style={styles.takenBadge}>Taken</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {med.times.length === 0 && (
        <Text style={styles.noTimesText}>No times scheduled — tap edit to add.</Text>
      )}
    </View>
  );
}

//Tyylit

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#E5F7FD",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5F7FD",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1F2937",
  },

  emptyBox: {
    alignItems: "center",
    marginTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  emptySubText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  cardName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    flexShrink: 1,
  },
  cardActions: {
    flexDirection: "row",
    gap: 4,
  },
  iconButton: {
    padding: 6,
  },

  infoRow: {
    flexDirection: "row",
    marginBottom: 6,
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    width: 52,
  },
  infoValue: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  notesRow: {
    marginBottom: 6,
    gap: 4,
  },
  notesValue: {
    fontSize: 14,
    color: "#374151",
    fontStyle: "italic",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },

  timesLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  timeSlotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#009FE3",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#009FE3",
    borderColor: "#009FE3",
  },
  timeSlotText: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },
  timeSlotTextDone: {
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  takenBadge: {
    marginLeft: "auto",
    fontSize: 12,
    color: "#009FE3",
    fontWeight: "600",
    backgroundColor: "#E5F7FD",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  noTimesText: {
    fontSize: 13,
    color: "#9CA3AF",
    fontStyle: "italic",
    marginTop: 4,
  },

  screenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: "#009FE3",
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#1F2937",
    marginBottom: 12,
  },
  inputMultiline: {
    minHeight: 72,
    textAlignVertical: "top",
  },

  timeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  timeInput: {
    flex: 1,
    marginBottom: 0,
  },
  addTimeButton: {
    backgroundColor: "#009FE3",
    width: 46,
    height: 46,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  timeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E5F7FD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  timeChipText: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },

  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    paddingBottom: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  cancelText: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "600",
  },
  saveButton: {
    flex: 2,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#009FE3",
  },
  saveText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "700",
  },
});