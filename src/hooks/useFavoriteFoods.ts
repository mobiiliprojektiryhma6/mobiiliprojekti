import { useEffect, useState } from "react"
import { FoodItem } from "../../types/FoodItem"
import { getFavoriteFoods, addFavoriteFood, removeFavoriteFood } from "../../firebase/favorites"

export const useFavoriteFoods = () => {
    const [favoriteFoods, setFavoriteFoods] = useState<FoodItem[]>([])

    useEffect(() => {
        const loadFavorites = async () => {
            const favs = await getFavoriteFoods()
            setFavoriteFoods(favs)
        }
        loadFavorites()
    }, [])

    const toggleFavorite = async (food: FoodItem) => {
        console.log("TOGGLE FAVORITE:", food.name, food.id)

        const isFav = favoriteFoods.some((f) => f.id === food.id)
        console.log("  was favorite?", isFav)

        if (isFav) {
            await removeFavoriteFood(food.id)
            setFavoriteFoods((prev) => [...prev.filter((f) => f.id !== food.id)])
        } else {
            await addFavoriteFood(food)
            setFavoriteFoods((prev) => [...prev, food])
        }

        console.log("  now favorites:", favoriteFoods.map((f) => f.name))
    }

    const deleteFavorite = async (foodId: string) => {
        await removeFavoriteFood(foodId)
        setFavoriteFoods((prev) => prev.filter((f) => f.id !== foodId))
    }

    return {
        favoriteFoods,
        toggleFavorite,
        deleteFavorite,
    }
}
