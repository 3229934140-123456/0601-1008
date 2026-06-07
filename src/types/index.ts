export interface StoreInfo {
  id: string;
  name: string;
  address: string;
  region: string;
  templateId?: string;
  score?: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  spec: string;
  image: string;
  width: number;
  height: number;
  stock: number;
  stockWarning: boolean;
  color: string;
}

export type ShelfType = 'normal' | 'end' | 'display';

export interface ShelfProduct {
  productId: string;
  position: number;
  facings: number;
}

export interface ShelfLayer {
  id: string;
  height: number;
  position: number;
  products: ShelfProduct[];
}

export interface Shelf {
  id: string;
  name: string;
  type: ShelfType;
  totalWidth: number;
  layers: ShelfLayer[];
}

export type RuleType = 'adjacent_brand' | 'must_have' | 'forbidden_area' | 'facing_min';

export interface DisplayRule {
  id: string;
  type: RuleType;
  description: string;
  params: Record<string, any>;
  scoreWeight: number;
}

export interface RuleViolation {
  ruleId: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  shelfId?: string;
  layerId?: string;
  productId?: string;
}

export type RectificationStatus = 'pending' | 'in_progress' | 'completed';

export interface Rectification {
  id: string;
  title: string;
  description: string;
  assignee: string;
  status: RectificationStatus;
  createdAt: string;
  dueDate: string;
  completedAt?: string;
  photoRef?: string;
  shelfId?: string;
  ruleId?: string;
  layerId?: string;
  productId?: string;
}

export type PhotoType = 'standard' | 'onsite';

export interface Photo {
  id: string;
  url: string;
  name: string;
  type: PhotoType;
  shelfId?: string;
  uploadTime: string;
}

export interface AppState {
  currentStoreId: string;
  stores: StoreInfo[];
  products: Product[];
  shelves: Shelf[];
  rules: DisplayRule[];
  rectifications: Rectification[];
  photos: Photo[];
  currentShelfId: string;
  selectedCategory: string;
  searchKeyword: string;
  activePanel: 'rules' | 'rectifications' | 'export';
}
