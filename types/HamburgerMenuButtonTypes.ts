export type MenuRoute =
    | "Home"
    | "FoodDiary"
    | "FoodSearch"
    | "MealBuilder"
    | "Medications"
    | "FavoriteMeals"
    | "Logout";

export type HamburgerMenuButtonProps = {
    onNavigate: (screenName: MenuRoute) => void;
};
