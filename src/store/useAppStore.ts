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

function deepCloneShelves(shelves: Shelf[]): Shelf[] {
  return shelves.map(shelf => ({
    ...shelf,
    layers: shelf.layers.map(layer => ({
      ...layer,
      products: layer.products.map(p => ({ ...p })),
    })),
  }));
}

function initStoreShelves(): Record<string, Shelf[]> {
  const result: Record<string, Shelf[]> = {};
  mockStores.forEach((store) => {
    result[store.id] = deepCloneShelves(mockShelves).map(shelf => ({
      ...shelf,
      id: `${shelf.id}-${store.id}`,
      layers: shelf.layers.map(layer => ({
        ...layer,
        id: `${layer.id}-${store.id}`,
      })),
    }));
  });
  return result;
}

function initStoreRectifications(): Record<string, Rectification[]> {
  const result: Record<string, Rectification[]> = {};
  mockStores.forEach((store) => {
    result[store.id] = mockRectifications.map(r => ({
      ...r,
      id: `${r.id}-${store.id}`,
      shelfId: `${r.shelfId}-${store.id}`,
    }));
  });
  return result;
}

interface AppState {
  currentStoreId: string;
  stores: StoreInfo[];
  products: Product[];
  storeShelves: Record<string, Shelf[]>;
  storeRectifications: Record<string, Rectification[]>;
  rules: DisplayRule[];
  photos: Photo[];
  currentShelfId: string;
  selectedCategory: string;
  searchKeyword: string;
  activePanel: 'rules' | 'rectifications' | 'export';
  violations: RuleViolation[];
  totalScore: number;
  shelves: Shelf[];
  rectifications: Rectification[];

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
  updateRectification: (id: string, updates: Partial<Rectification>) => void;
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

function updateStoreShelves(state: AppState, storeId: string, newShelves: Shelf[]): Partial<AppState> {
  const isCurrentStore = storeId === state.currentStoreId;
  return {
    storeShelves: {
      ...state.storeShelves,
      [storeId]: newShelves,
    },
    ...(isCurrentStore ? { shelves: newShelves } : {}),
  };
}

function updateStoreRectifications(state: AppState, storeId: string, newRects: Rectification[]): Partial<AppState> {
  const isCurrentStore = storeId === state.currentStoreId;
  return {
    storeRectifications: {
      ...state.storeRectifications,
      [storeId]: newRects,
    },
    ...(isCurrentStore ? { rectifications: newRects } : {}),
  };
}

export const useAppStore = create<AppState>((set, get) => {
  const initialStoreShelves = initStoreShelves();
  const initialStoreRectifications = initStoreRectifications();
  const firstStoreId = mockStores[0].id;
  const firstShelves = initialStoreShelves[firstStoreId];
  const firstRects = initialStoreRectifications[firstStoreId];

  return {
    currentStoreId: firstStoreId,
    stores: mockStores,
    products: mockProducts,
    storeShelves: initialStoreShelves,
    storeRectifications: initialStoreRectifications,
    rules: mockRules,
    photos: mockPhotos,
    currentShelfId: firstShelves[0]?.id || '',
    selectedCategory: '全部',
    searchKeyword: '',
    activePanel: 'rules',
    violations: [],
    totalScore: 100,
    shelves: firstShelves,
    rectifications: firstRects,

    setCurrentStore: (id) => {
      const state = get();
      const newShelves = state.storeShelves[id] || [];
      const newRects = state.storeRectifications[id] || [];
      const firstShelfId = newShelves[0]?.id || '';

      set({
        currentStoreId: id,
        shelves: newShelves,
        rectifications: newRects,
        currentShelfId: firstShelfId,
      });

      get().calculateViolations();
      get().calculateScore();
    },

    setCurrentShelf: (id) => set({ currentShelfId: id }),
    setSelectedCategory: (category) => set({ selectedCategory: category }),
    setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
    setActivePanel: (panel) => set({ activePanel: panel }),

    addProductToLayer: (shelfId, layerId, productId, position, facings) => {
      const state = get();
      const currentShelves = state.storeShelves[state.currentStoreId] || [];
      const newShelves = currentShelves.map((shelf) => {
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

      set(updateStoreShelves(state, state.currentStoreId, newShelves));
      get().calculateViolations();
      get().calculateScore();
    },

    removeProductFromLayer: (shelfId, layerId, productId) => {
      const state = get();
      const currentShelves = state.storeShelves[state.currentStoreId] || [];
      const newShelves = currentShelves.map((shelf) => {
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

      set(updateStoreShelves(state, state.currentStoreId, newShelves));
      get().calculateViolations();
      get().calculateScore();
    },

    moveProductInLayer: (shelfId, layerId, productId, newPosition) => {
      const state = get();
      const currentShelves = state.storeShelves[state.currentStoreId] || [];
      const newShelves = currentShelves.map((shelf) => {
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

      set(updateStoreShelves(state, state.currentStoreId, newShelves));
      get().calculateViolations();
      get().calculateScore();
    },

    updateProductFacings: (shelfId, layerId, productId, facings) => {
      const state = get();
      const currentShelves = state.storeShelves[state.currentStoreId] || [];
      const newShelves = currentShelves.map((shelf) => {
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

      set(updateStoreShelves(state, state.currentStoreId, newShelves));
      get().calculateViolations();
      get().calculateScore();
    },

    updateLayerHeight: (shelfId, layerId, height) => {
      const state = get();
      const currentShelves = state.storeShelves[state.currentStoreId] || [];
      const newShelves = currentShelves.map((shelf) => {
        if (shelf.id !== shelfId) return shelf;
        return {
          ...shelf,
          layers: shelf.layers.map((layer) =>
            layer.id === layerId ? { ...layer, height } : layer
          ),
        };
      });

      set(updateStoreShelves(state, state.currentStoreId, newShelves));
    },

    addLayer: (shelfId) => {
      const state = get();
      const currentShelves = state.storeShelves[state.currentStoreId] || [];
      const newShelves = currentShelves.map((shelf) => {
        if (shelf.id !== shelfId) return shelf;
        const newLayer: ShelfLayer = {
          id: `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          height: 30,
          position: shelf.layers.length,
          products: [],
        };
        return { ...shelf, layers: [...shelf.layers, newLayer] };
      });

      set(updateStoreShelves(state, state.currentStoreId, newShelves));
      get().calculateViolations();
      get().calculateScore();
    },

    removeLayer: (shelfId, layerId) => {
      const state = get();
      const currentShelves = state.storeShelves[state.currentStoreId] || [];
      const newShelves = currentShelves.map((shelf) => {
        if (shelf.id !== shelfId) return shelf;
        return {
          ...shelf,
          layers: shelf.layers.filter((l) => l.id !== layerId),
        };
      });

      set(updateStoreShelves(state, state.currentStoreId, newShelves));
      get().calculateViolations();
      get().calculateScore();
    },

    addRectification: (rect) => {
      const state = get();
      const currentRects = state.storeRectifications[state.currentStoreId] || [];
      const newRect: Rectification = {
        priority: 'medium',
        ...rect,
        id: `rect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toLocaleString('zh-CN'),
      };
      const newRects = [...currentRects, newRect];
      set(updateStoreRectifications(state, state.currentStoreId, newRects));
    },

    updateRectification: (id, updates) => {
      const state = get();
      const currentRects = state.storeRectifications[state.currentStoreId] || [];
      const newRects = currentRects.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, ...updates };
        if (updates.status === 'completed' && !updated.completedAt) {
          updated.completedAt = new Date().toLocaleString('zh-CN');
        }
        if (updates.status && updates.status !== 'completed') {
          updated.completedAt = undefined;
        }
        return updated;
      });
      set(updateStoreRectifications(state, state.currentStoreId, newRects));
    },

    updateRectificationStatus: (id, status) => {
      const state = get();
      get().updateRectification(id, { status });
    },

    assignRectification: (id, assignee) => {
      const state = get();
      const currentRects = state.storeRectifications[state.currentStoreId] || [];
      const newRects = currentRects.map((r) =>
        r.id === id ? { ...r, assignee } : r
      );
      set(updateStoreRectifications(state, state.currentStoreId, newRects));
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

      const sourceShelves = state.storeShelves[sourceId];
      if (!sourceShelves || sourceShelves.length === 0) {
        return { success: false, error: '源门店没有货架数据' };
      }

      const copiedShelves = deepCloneShelves(sourceShelves).map(shelf => ({
        ...shelf,
        id: shelf.id.replace(`-${sourceId}`, `-${targetId}`),
        layers: shelf.layers.map(layer => ({
          ...layer,
          id: layer.id.replace(`-${sourceId}`, `-${targetId}`),
        })),
      }));

      const sourceRects = state.storeRectifications[sourceId] || [];
      const copiedRects = sourceRects.map(rect => ({
        ...rect,
        id: `${rect.id}-copy-${targetId}`,
        shelfId: rect.shelfId?.replace(`-${sourceId}`, `-${targetId}`),
      }));

      const newStoreShelves = {
        ...state.storeShelves,
        [targetId]: copiedShelves,
      };
      const newStoreRectifications = {
        ...state.storeRectifications,
        [targetId]: copiedRects,
      };

      const isTargetCurrent = targetId === state.currentStoreId;
      set({
        storeShelves: newStoreShelves,
        storeRectifications: newStoreRectifications,
        ...(isTargetCurrent ? {
          shelves: copiedShelves,
          rectifications: copiedRects,
          currentShelfId: copiedShelves[0]?.id || state.currentShelfId,
        } : {}),
      });

      if (isTargetCurrent) {
        get().calculateViolations();
        get().calculateScore();
      }

      return { success: true };
    },

    saveAsTemplate: () => {},

    addRectificationFromViolation: (violation) => {
      const state = get();
      const currentRects = state.storeRectifications[state.currentStoreId] || [];
      const currentShelves = state.storeShelves[state.currentStoreId] || [];

      const exists = currentRects.some((r) => {
        if (r.ruleId !== violation.ruleId) return false;
        if (r.shelfId !== violation.shelfId) return false;
        if (r.layerId !== violation.layerId) return false;
        if (violation.productIds && r.productIds) {
          const vIds = [...violation.productIds].sort().join(',');
          const rIds = [...r.productIds].sort().join(',');
          return vIds === rIds;
        }
        return r.productId === violation.productId;
      });

      if (exists) {
        return { success: false, alreadyExists: true };
      }

      const shelfName = currentShelves.find((s) => s.id === violation.shelfId)?.name || '未知货架';
      const priority = violation.severity === 'error' ? 'high' : violation.severity === 'warning' ? 'medium' : 'low';

      const newRect: Rectification = {
        id: `rect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: violation.description,
        description: `违规说明：${violation.description}\n关联货架：${shelfName}`,
        assignee: '张三',
        status: 'pending',
        priority,
        createdAt: new Date().toLocaleString('zh-CN'),
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('zh-CN'),
        shelfId: violation.shelfId,
        ruleId: violation.ruleId,
        layerId: violation.layerId,
        productId: violation.productId,
        productIds: violation.productIds,
      };

      const newRects = [...currentRects, newRect];
      set(updateStoreRectifications(state, state.currentStoreId, newRects));

      return { success: true, alreadyExists: false };
    },

    getStoreById: (id) => {
      return get().stores.find(s => s.id === id);
    },

    calculateViolations: () => {
      const state = get();
      const violations: RuleViolation[] = [];
      const currentShelves = state.storeShelves[state.currentStoreId] || [];
      const { products, rules } = state;

      currentShelves.forEach((shelf) => {
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
                    productIds: [productList[i].productId, productList[i + 1].productId],
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
  };
});
