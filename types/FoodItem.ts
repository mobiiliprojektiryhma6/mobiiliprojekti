
export interface FoodItem {
  id: string;
  name: string;
  energy: number;
  carbohydrates: number;
  protein: number;
  fat: number;

  servingSize?: number;
  per100g?: boolean;
  barcode?: string;
  category?: string;
  notes?: string;
}
