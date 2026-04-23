import { useEffect, useState } from "react"
import { getFavoriteMeals } from "../../firebase/favoriteMeals"

export const useFavoriteMeals = () => {
    const [meals, setMeals] = useState<any[]>([])

    useEffect(() => {
        const load = async () => {
            const favs = await getFavoriteMeals()
            setMeals(favs)
        }
        load()
    }, [])

    return {
        meals,
    }
}
