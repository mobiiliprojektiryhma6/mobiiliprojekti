import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../../firebase/config"
import { FoodItem } from "../../types/FoodItem"

export const useMealBuilderProducts = (authReady: boolean) => {
    const [products, setProducts] = useState<FoodItem[]>([])

    useEffect(() => {
        if (!authReady) return

        const loadProducts = async () => {
            const snapshot = await getDocs(collection(db, "products"))
            const items = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as FoodItem[]

            setProducts(items)
        }

        loadProducts()
    }, [authReady])

    return {
        products,
    }
}
