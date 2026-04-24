# GlugoMate
 
A mobile application built with React Native and Expo, designed to help diabetic patients and health-conscious users track their daily food intake, monitor carbohydrate consumption, and manage their medications.
 
---
 
## Features
 
### Food Tracking
- **Food Diary** — Log meals by type (Breakfast, Lunch, Snack, Dinner) and browse entries by date. Each meal card shows an expandable view with a per-food carbohydrate bar chart, nutritional totals, and inline edit/delete actions.
- **Meal Builder** — Build a meal from scratch by searching the product database, picking from favorites, adding custom foods, or importing a previously saved favorite meal. Each food item supports gram-based serving size scaling.
- **Food Search** — Dual search combining an instant local Firestore product database with a debounced Open Food Facts API search. Results are cached to Firestore automatically to speed up future searches.
- **Barcode Scanner** — Scan product barcodes using the device camera. Previously scanned products are served from a Firestore cache to avoid redundant API calls.
- **Favorites** — Mark individual food items or entire meals as favorites for quick reuse. Managed via dedicated `FavoriteFoodsScreen` and `FavoriteMeals` screens.
### Dashboard
- **Home Screen** — Displays today's carbohydrate consumption as a pie chart broken down by meal type, alongside a summary showing consumed, target, and remaining carbs for the day.
- **Weekly Summary** — Line chart comparing current week carb intake against the same days of the previous week.
- **Carb Target** — Supports both a recommended target (calculated using the Mifflin-St Jeor BMR formula based on user height and weight) and a manual custom target set by the user.
### Medications
- **Medication Screen** — Add and manage medications with name, dose, usage description, notes, and scheduled times. Each medication shows a daily checklist of scheduled doses. Checked state resets automatically at midnight and is stored locally via AsyncStorage — no unnecessary Firestore reads or writes.
### Profile
- **Personal information** — Store height and weight, used to calculate the recommended carb target.
- **Health information** — Collapsible sections for diseases, medications, and allergies with add/delete support.
- **Profile picture** — Take a photo or pick from the gallery. Image URI is stored in Firestore.
- **Diabetes resource links** — Quick links to Diabetesliitto, omaKanta, and Terveyskylä Diabetestalo.
### Account Settings
- Change display name
- Change password (requires current password re-authentication)
- Delete account with full Firestore data removal (requires username confirmation and password)
### Authentication
- Email and password registration and login via Firebase Authentication
- Auth state persisted across app restarts
- Auth-gated navigation — unauthenticated users only see the login screen
---
## Project Structure
 
```
├── App.tsx                        # Root component, auth-gated navigation
├── index.ts                       # Expo entry point
├── firebase/
│   ├── config.ts                  # Firebase initialization (not committed)
│   ├── favorites.ts               # Favorite foods Firestore helpers
│   └── favoriteMeals.ts           # Favorite meals Firestore helpers
├── screens/
│   ├── Homescreen.tsx             # Dashboard with carb chart and daily summary
│   ├── FoodDiaryScreen.tsx        # Date-navigable meal log
│   ├── FoodSearchScreen.tsx       # Local + Open Food Facts food search
│   ├── MealBuilderScreen.tsx      # Meal composition and saving
│   ├── BarcodeScanner.tsx         # Camera-based barcode lookup
│   ├── MedicationScreen.tsx       # Medication management with daily checklist
│   ├── ProfileScreen.tsx          # User profile and health info
│   ├── AccountSettingsScreen.tsx  # Username, password, account deletion
│   ├── FavoriteFoodsScreen.tsx    # Saved favorite food items
│   ├── FavoriteMeals.tsx          # Saved favorite meals
│   ├── Loginscreen.tsx            # Login / register toggle
│   └── RegisterUser.tsx           # Registration screen
├── components/
│   ├── navigation/
│   │   └── HamburgerMenuButton.tsx
│   ├── DiaryMealCard.tsx          # Expandable meal card with bar chart
│   ├── MealCard.tsx               # Food item card with nutrient bars
│   ├── EditFood.tsx               # Edit food in a logged meal
│   ├── EditModal.tsx              # Shared modal for profile editing
│   ├── FoodInput.tsx              # Manual food entry form
│   ├── GramsPopup.tsx             # Serving size input popup
│   ├── HealthSection.tsx          # Collapsible health info section
│   ├── NutritionalCircle.tsx      # SVG donut chart for macros
│   ├── CarbsPerMealChart.tsx      # Bar chart for carbs per meal type
│   ├── TodaysCarbsGraph.tsx       # Pie chart wrapper for home screen
│   ├── WeeklyCarbSummary.tsx      # Weekly line chart with comparison
│   ├── ProfileHeader.tsx          # Profile name, email and avatar
│   ├── PersonalInfoSection.tsx    # Height and weight display
│   ├── Login.tsx                  # Login form
│   ├── Register.tsx               # Registration form
│   ├── Logout.tsx                 # Logout button
│   └── AuthStatus.tsx             # Debug auth status display
├── src/
│   ├── hooks/
│   │   ├── useAuth.ts             # Firebase auth state
│   │   ├── useTodayCarbsChart.ts  # Carb chart data and target logic
│   │   ├── useFavoriteFoods.ts    # Favorite foods state and actions
│   │   ├── useFavoriteMeals.ts    # Favorite meals state
│   │   ├── useHamburgerMenuButton.ts
│   │   ├── useMealBuilderProducts.ts
│   │   └── useProfileData.ts
│   ├── styles/
│   │   └── globalStyles.ts        # Centralized StyleSheet for all components
│   ├── theme/
│   │   ├── theme.ts               # Design tokens (colors, spacing, radius)
│   │   └── ThemeContext.tsx       # React context for theme access
│   ├── navigation/
│   │   └── Navigator.tsx
│   └── utils/
│       ├── carbTarget.ts          # BMR-based carb target calculation
│       ├── dateUtils.ts           # Date key formatting
│       ├── mealNutritionUtils.ts  # Macro calculation and meal grouping
│       ├── productCache.ts        # Firestore product cache read/write
│       └── todaysCarbsChart.ts    # Pie chart data mapping utilities
└── types/
    ├── FoodItem.ts
    ├── MealTypes.ts
    ├── MealCardTypes.ts
    ├── CarbTargetTypes.ts
    ├── TodayCarbsChart.ts
    ├── HamburgerMenuButtonTypes.ts
    ├── RegisterTypes.ts
    └── firebaseAuth.d.ts
```
 
---

### Installation & Running the App

```bash
git clone https://github.com/mobiiliprojektiryhma6/mobiiliprojekti.git
cd mobiiliprojekti
npm install
# Start Expo dev server
npx expo start
 
# Run on Android
npx expo run:android

```
