import { collection, query, where, getDocs, addDoc, limit } from "firebase/firestore";
import { db } from "../../firebase/config";
import { FoodItem } from "../../types/FoodItem";

/**
 * Check if a product with the given barcode already exists in Firestore.
 * Returns the cached product or null.
 */
export async function getProductByBarcode(barcode: string): Promise<FoodItem | null> {
    try {
        const q = query(
            collection(db, "products"),
            where("barcode", "==", barcode),
            limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            return { id: doc.id, ...doc.data() } as FoodItem;
        }
        return null;
    } catch (e) {
        console.error("getProductByBarcode failed:", e);
        return null;
    }
}

/**
 * Save API-fetched products to Firestore for future cache hits.
 * Skips duplicates by checking barcode (if available) or lowercase name.
 */
export async function saveProductsToFirestore(items: FoodItem[]): Promise<void> {
    const productsRef = collection(db, "products");

    for (const item of items) {
        try {
            // Check for existing product by barcode first, then by name
            let exists = false;

            if (item.barcode) {
                const barcodeQuery = query(
                    productsRef,
                    where("barcode", "==", item.barcode),
                    limit(1)
                );
                const barcodeSnap = await getDocs(barcodeQuery);
                exists = !barcodeSnap.empty;
            }

            if (!exists) {
                const nameQuery = query(
                    productsRef,
                    where("nameLower", "==", item.name.toLowerCase()),
                    limit(1)
                );
                const nameSnap = await getDocs(nameQuery);
                exists = !nameSnap.empty;
            }

            if (!exists) {
                await addDoc(productsRef, {
                    name: item.name,
                    nameLower: item.name.toLowerCase(),
                    energy: item.energy,
                    carbohydrates: item.carbohydrates,
                    protein: item.protein,
                    fat: item.fat,
                    barcode: item.barcode || "",
                    source: "api",
                    cachedAt: Date.now(),
                });
            }
        } catch (e) {
            console.error("Failed to cache product:", item.name, e);
        }
    }
}
