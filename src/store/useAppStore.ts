import { create } from 'zustand';
import {
  StoreInfo,
  Product,
  Shelf,
  ShelfProduct,
  ShelfLayer,
  DisplayRule,
  Rectification,
  Photo,
  RuleViolation,
} from '@/types';
import {
  mockStores,
  mockProducts,
  mockShelves,
  mockRules,
  mockRectifications,
  mockPhotos,
} from '@/data/mockData';

interface AppState {
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
  violations: RuleViolation[];
  totalScore: number;

  setCurrentStore: (id: string) => void;
  setCurrentShelf: (id: string) => void;
  setSelectedCategory: (category: string) => void;
  setSearchKeyword: (keyword: string) => void;
  setActivePanel: (panel: 'rules' | 'rectifications' | 'export') => void;

  addProductToLayer: (shelfId: string, layerId: string, productId: string, position: number, facings: number) => void;
  removeProductFromLayer: (shelfId: string, layerId: string, productId: string) => void;
  moveProductInLayer: (shelfId: string, layerId: string, productId: string, newPosition: number) => void;
  updateProductFacings: (shelfId: string, layerId: string, productId: string, facings: number) => void;

  updateLayerHeight: (shelfId: string, layerId: string, height: number) => void;
  addLayer: (shelfId: string) => void;
  removeLayer: (shelfId: string, layerId: string) => void;

  addRectification: (rect: Omit<Rectification, 'id' | 'createdAt'>) => void;
  updateRectificationStatus: (id: string, status: Rectification['status']) => void;
  assignRectification: (id: string, assignee: string) => void;

  addPhoto: (photo: Omit<Photo, 'id' | 'uploadTime'>) => void;
  removePhoto: (id: string) => void;

  copyStoreTemplate: (sourceStoreId: string, targetStoreId: string) => { success: boolean; error?: string };
  saveAsTemplate: (storeId: string) => void;
  addRectificationFromViolation: (violation: RuleViolation) => { success: boolean; alreadyExists: boolean };
  getStoreById: (id: string) => StoreInfo | undefined;

  calculateViolations: () => void;
  calculateScore: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentStoreId: 'store-1',
  stores: mockStores,
  products: mockProducts,
  shelves: mockShelves,
  rules: mockRules,
  rectifications: mockRectifications,
  photos: mockPhotos,
  currentShelfId: 'shelf-1',
  selectedCategory: '全部',
  searchKeyword: '',
  activePanel: 'rules',
  violations: [],
  totalScore: 100,

  setCurrentStore: (id) => set({ currentStoreId: id }),
  setCurrentShelf: (id) => set({ currentShelfId: id }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
  setActivePanel: (panel) => set({ activePanel: panel }),

  addProductToLayer: (shelfId, layerId, productId, position, facings) => {
    set((state) => {
      const newShelves = state.shelves.map((shelf) => {
        if (shelf.id !== shelfId) return shelf;
        return {
          ...shelf,
          layers: shelf.layers.map((layer) => {
            if (layer.id !== layerId) return layer;
            const newProduct: ShelfProduct = { productId, position, facings };
            return { ...layer, products: [...layer.products, newProduct] };
          }),
        };
      });
      return { shelves: newShelves };
    });
    get().calculateViolations();
    get().calculateScore();
  },

  removeProductFromLayer: (shelfId, layerId, productId) => {
    set((state) => {
      const newShelves = state.shelves.map((shelf) => {
        if (shelf.id !== shelfId) return shelf;
        return {
          ...shelf,
          layers: shelf.layers.map((layer) => {
            if (layer.id !== layerId) return layer;
            return {
              ...layer,
              products: layer.products.filter((p) => p.productId !== productId),
            };
          }),
        };
      });
      return { shelves: newShelves };
    });
    get().calculateViolations();
    get().calculateScore();
  },

  moveProductInLayer: (shelfId, layerId, productId, newPosition) => {
    set((state) => {
      const newShelves = state.shelves.map((shelf) => {
        if (shelf.id !== shelfId) return shelf;
        return {
          ...shelf,
          layers: shelf.layers.map((layer) => {
            if (layer.id !== layerId) return layer;
            return {
              ...layer,
              products: layer.products.map((p) =>
                p.productId === productId ? { ...p, position: newPosition } : p
              ),
            };
          }),
        };
      });
      return { shelves: newShelves };
    });
    get().calculateViolations();
    get().calculateScore();
  },

  updateProductFacings: (shelfId, layerId, productId, facings) => {
    set((state) => {
      const newShelves = state.shelves.map((shelf) => {
        if (shelf.id !== shelfId) return shelf;
        return {
          ...shelf,
          layers: shelf.layers.map((layer) => {
            if (layer.id !== layerId) return layer;
            return {
              ...layer,
              products: layer.products.map((p) =>
                p.productId === productId ? { ...p, facings } : p
              ),
            };
          }),
        };
      });
      return { shelves: newShelves };
    });
    get().calculateViolations();
    get().calculateScore();
  },

  updateLayerHeight: (shelfId, layerId, height) => {
    set((state) => {
      const newShelves = state.shelves.map((shelf) => {
        if (shelf.id !== shelfId) return shelf;
        return {
          ...shelf,
          layers: shelf.layers.map((layer) =>
            layer.id === layerId ? { ...layer, height } : layer
          ),
        };
      });
      return { shelves: newShelves };
    });
  },

  addLayer: (shelfId) => {
    set((state) => {
      const newShelves = state.shelves.map((shelf) => {
        if (shelf.id !== shelfId) return shelf;
        const newLayer: ShelfLayer = {
          id: `layer-${Date.now()}`,
          height: 30,
          position: shelf.layers.length,
          products: [],
        };
        return { ...shelf, layers: [...shelf.layers, newLayer] };
      });
      return { shelves: newShelves };
    });
    get().calculateViolations();
    get().calculateScore();
  },

  removeLayer: (shelfId, layerId) => {
    set((state) => {
      const newShelves = state.shelves.map((shelf) => {
        if (shelf.id !== shelfId) return shelf;
        return {
          ...shelf,
          layers: shelf.layers.filter((l) => l.id !== layerId),
        };
      });
      return { shelves: newShelves };
    });
    get().calculateViolations();
    get().calculateScore();
  },

  addRectification: (rect) => {
    set((state) => {
      const newRect: Rectification = {
        ...rect,
        id: `rect-${Date.now()}`,
        createdAt: new Date().toLocaleString('zh-CN'),
      };
      return { rectifications: [...state.rectifications, newRect] };
    });
  },

  updateRectificationStatus: (id, status) => {
    set((state) => ({
      rectifications: state.rectifications.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              completedAt: status === 'completed' ? new Date().toLocaleString('zh-CN') : undefined,
            }
          : r
      ),
    }));
  },

  assignRectification: (id, assignee) => {
    set((state) => ({
      rectifications: state.rectifications.map((r) =>
        r.id === id ? { ...r, assignee } : r
      ),
    }));
  },

  addPhoto: (photo) => {
    set((state) => {
      const newPhoto: Photo = {
        ...photo,
        id: `photo-${Date.now()}`,
        uploadTime: new Date().toLocaleString('zh-CN'),
      };
      return { photos: [...state.photos, newPhoto] };
    });
  },

  removePhoto: (id) => {
    set((state) => ({
      photos: state.photos.filter((p) => p.id !== id),
    }));
  },

  copyStoreTemplate: (sourceId, targetId) => {
    const state = get();
    const sourceStore = state.stores.find(s => s.id === sourceId);
    const targetStore = state.stores.find(s => s.id === targetId);

    if (!sourceStore && !targetStore) {
      return { success: false, error: '源门店和目标门店都不存在' };
    }
    if (!sourceStore) {
      return { success: false, error: '源门店不存在' };
    }
    if (!targetStore) {
      return { success: false, error: '目标门店不存在' };
    }
    if (sourceId === targetId) {
      return { success: false, error: '源门店和目标门店不能相同' };
    }

    const sourceShelves = state.shelves.filter(s => s.id.startsWith('shelf-'));
    if (sourceShelves.length === 0) {
      return { success: false, error: '源门店没有货架数据' };
    }

    const newShelves = sourceShelves.map(shelf => ({
      ...shelf,
      id: `${shelf.id}-${targetId}`,
      layers: shelf.layers.map(layer => ({
        ...layer,
        id: `${layer.id}-${targetId}`,
        products: layer.products.map(p => ({ ...p })),
      })),
    }));

    const otherShelves = state.shelves.filter(s => !s.id.endsWith(`-${targetId}`) && !s.id.startsWith('shelf-'));
    
    set({
      shelves: [...otherShelves, ...newShelves],
      currentShelfId: newShelves[0]?.id || state.currentShelfId,
    });

    get().calculateViolations();
    get().calculateScore();

    return { success: true };
  },

  saveAsTemplate: () => {},

  addRectificationFromViolation: (violation) => {
    const state = get();
    const exists = state.rectifications.some(
      r => r.title === violation.description && r.shelfId === violation.shelfId
    );

    if (exists) {
      return { success: false, alreadyExists: true };
    }

    const shelfName = state.shelves.find(s => s.id === violation.shelfId)?.name || '未知货架';
    
    const newRect: Rectification = {
      id: `rect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: violation.description.length > 30 ? violation.description.substring(0, 30) + '...' : violation.description,
      description: `${violation.description}\n关联货架：${shelfName}`,
      assignee: '张三',
      status: 'pending',
      createdAt: new Date().toLocaleString('zh-CN'),
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleString('zh-CN'),
      shelfId: violation.shelfId,
    };

    set(state => ({
      rectifications: [...state.rectifications, newRect],
    }));

    return { success: true, alreadyExists: false };
  },

  getStoreById: (id) => {
    return get().stores.find(s => s.id === id);
  },

  calculateViolations: () => {
    const state = get();
    const violations: RuleViolation[] = [];
    const { shelves, products, rules } = state;

    shelves.forEach((shelf) => {
      shelf.layers.forEach((layer, layerIndex) => {
        const sortedProducts = [...layer.products].sort((a, b) => a.position - b.position);
        const productList = sortedProducts.map((sp) => ({
          ...sp,
          product: products.find((p) => p.id === sp.productId),
        }));

        rules.forEach((rule) => {
          if (rule.type === 'adjacent_brand') {
            const brands = rule.params.brands as string[];
            for (let i = 0; i < productList.length - 1; i++) {
              const current = productList[i].product;
              const next = productList[i + 1].product;
              if (
                current &&
                next &&
                brands.includes(current.brand) &&
                brands.includes(next.brand) &&
                current.brand !== next.brand
              ) {
                violations.push({
                  ruleId: rule.id,
                  description: `${current.name} 与 ${next.name} 相邻，违反品牌隔离规则`,
                  severity: 'error',
                  shelfId: shelf.id,
                  layerId: layer.id,
                });
              }
            }
          }

          if (rule.type === 'must_have') {
            const params = rule.params;
            if (
              params.shelfType === shelf.type &&
              params.layerIndex === layerIndex
            ) {
              const hasProduct = layer.products.some(
                (p) => p.productId === params.productId
              );
              if (!hasProduct) {
                violations.push({
                  ruleId: rule.id,
                  description: rule.description,
                  severity: 'error',
                  shelfId: shelf.id,
                  layerId: layer.id,
                });
              }
            }
          }

          if (rule.type === 'facing_min') {
            const params = rule.params;
            if (params.productIds) {
              layer.products.forEach((sp) => {
                if (params.productIds.includes(sp.productId)) {
                  if (sp.facings < params.minFacings) {
                    const product = products.find((p) => p.id === sp.productId);
                    violations.push({
                      ruleId: rule.id,
                      description: `${product?.name || '商品'} 排面数为 ${sp.facings}，少于要求的 ${params.minFacings} 个`,
                      severity: 'warning',
                      shelfId: shelf.id,
                      layerId: layer.id,
                      productId: sp.productId,
                    });
                  }
                }
              });
            }
          }

          if (rule.type === 'forbidden_area') {
            const params = rule.params;
            if (params.shelfType === shelf.type) {
              layer.products.forEach((sp) => {
                const product = products.find((p) => p.id === sp.productId);
                if (product && !params.allowedCategories.includes(product.category)) {
                  violations.push({
                    ruleId: rule.id,
                    description: `${product.name} 不允许陈列在 ${shelf.type === 'display' ? '堆头' : '此区域'}`,
                    severity: 'error',
                    shelfId: shelf.id,
                    layerId: layer.id,
                    productId: sp.productId,
                  });
                }
              });
            }
          }
        });
      });
    });

    set({ violations });
  },

  calculateScore: () => {
    const state = get();
    const { rules, violations } = state;
    const totalWeight = rules.reduce((sum, r) => sum + r.scoreWeight, 0);
    const violatedWeight = violations.reduce((sum, v) => {
      const rule = rules.find((r) => r.id === v.ruleId);
      return sum + (rule ? rule.scoreWeight : 0);
    }, 0);
    const score = Math.max(0, Math.round(100 - (violatedWeight / totalWeight) * 100));
    set({ totalScore: score });
  },
}));
