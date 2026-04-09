import { db } from "../firebase/config";
import { getAuth } from "firebase/auth";
import { collection, doc, setDoc, deleteDoc, getDocs } from "firebase/firestore";
import { FoodItem } from "../types/FoodItem";

const getUserId = () => {
  const user = getAuth().currentUser;
  if (!user) throw new Error("User not logged in");
  return user.uid;
};

export const addFavoriteFood = async (food: FoodItem) => {
  const uid = getUserId();
  const ref = doc(db, "users", uid, "favorites", food.id);
  await setDoc(ref, food);
};

export const removeFavoriteFood = async (foodId: string) => {
  const uid = getUserId();
  const ref = doc(db, "users", uid, "favorites", foodId);
  await deleteDoc(ref);
};

export const getFavoriteFoods = async (): Promise<FoodItem[]> => {
  const uid = getUserId();
  const snapshot = await getDocs(collection(db, "users", uid, "favorites"));
  return snapshot.docs.map(doc => doc.data() as FoodItem);
};
