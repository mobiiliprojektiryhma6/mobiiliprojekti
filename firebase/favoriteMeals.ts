import { db } from "../firebase/config";
import { getAuth } from "firebase/auth";
import { collection, doc, setDoc, deleteDoc, getDocs } from "firebase/firestore";

const getUserId = () => {
  const user = getAuth().currentUser;
  if (!user) throw new Error("User not logged in");
  return user.uid;
};

export const addFavoriteMeal = async (meal: any) => {
  const uid = getUserId();
  const ref = doc(db, "users", uid, "favoriteMeals", meal.id);

  await setDoc(ref, {
    ...meal,
    savedAt: Date.now(),
  });
};

export const removeFavoriteMeal = async (mealId: string) => {
  const uid = getUserId();
  const ref = doc(db, "users", uid, "favoriteMeals", mealId);
  await deleteDoc(ref);
};

export const getFavoriteMeals = async () => {
  const uid = getUserId();
  const snapshot = await getDocs(collection(db, "users", uid, "favoriteMeals"));
  return snapshot.docs.map(doc => doc.data());
};
