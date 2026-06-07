import { Product, ShelfProduct, ShelfLayer } from '@/types';

export function calculateFacings(
  productWidth: number,
  layerWidth: number,
  existingProducts: ShelfProduct[],
  productList: Product[]
): number {
  const usedWidth = existingProducts.reduce((sum, sp) => {
    const p = productList.find((prod) => prod.id === sp.productId);
    return sum + (p ? p.width * sp.facings : 0);
  }, 0);
  const remainingWidth = layerWidth - usedWidth;
  return Math.floor(remainingWidth / productWidth);
}

export function canPlaceProduct(
  productWidth: number,
  facings: number,
  position: number,
  layerWidth: number,
  existingProducts: ShelfProduct[],
  productList: Product[],
  excludeProductId?: string
): boolean {
  const productEnd = position + productWidth * facings;
  if (productEnd > layerWidth || position < 0) return false;

  for (const sp of existingProducts) {
    if (excludeProductId && sp.productId === excludeProductId) continue;
    const p = productList.find((prod) => prod.id === sp.productId);
    if (!p) continue;
    const spStart = sp.position;
    const spEnd = sp.position + p.width * sp.facings;
    if (position < spEnd && productEnd > spStart) {
      return false;
    }
  }
  return true;
}

export function findNearestPosition(
  targetPosition: number,
  productWidth: number,
  facings: number,
  layerWidth: number,
  existingProducts: ShelfProduct[],
  productList: Product[],
  excludeProductId?: string
): number {
  if (canPlaceProduct(productWidth, facings, targetPosition, layerWidth, existingProducts, productList, excludeProductId)) {
    return targetPosition;
  }

  const positions: number[] = [0];
  const sorted = [...existingProducts]
    .filter((sp) => !excludeProductId || sp.productId !== excludeProductId)
    .sort((a, b) => a.position - b.position);

  for (const sp of sorted) {
    const p = productList.find((prod) => prod.id === sp.productId);
    if (p) {
      positions.push(sp.position + p.width * sp.facings);
    }
  }

  let bestPosition = 0;
  let minDistance = Infinity;

  for (const pos of positions) {
    if (canPlaceProduct(productWidth, facings, pos, layerWidth, existingProducts, productList, excludeProductId)) {
      const distance = Math.abs(pos - targetPosition);
      if (distance < minDistance) {
        minDistance = distance;
        bestPosition = pos;
      }
    }
  }

  return bestPosition;
}

export function calculateLayerFillRate(
  layer: ShelfLayer,
  layerWidth: number,
  productList: Product[]
): number {
  const usedWidth = layer.products.reduce((sum, sp) => {
    const p = productList.find((prod) => prod.id === sp.productId);
    return sum + (p ? p.width * sp.facings : 0);
  }, 0);
  return usedWidth / layerWidth;
}

export function getShelfTypeLabel(type: string): string {
  const map: Record<string, string> = {
    normal: '普通货架',
    end: '端架',
    display: '堆头',
  };
  return map[type] || type;
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: '待处理',
    in_progress: '进行中',
    completed: '已完成',
  };
  return map[status] || status;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
}

export function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getMaxFacingsForProduct(
  productId: string,
  productWidth: number,
  currentFacings: number,
  position: number,
  layerWidth: number,
  existingProducts: ShelfProduct[],
  productList: Product[]
): number {
  let maxFacings = currentFacings;
  
  while (true) {
    const nextFacings = maxFacings + 1;
    if (canPlaceProduct(productWidth, nextFacings, position, layerWidth, existingProducts, productList, productId)) {
      maxFacings = nextFacings;
    } else {
      break;
    }
    if (maxFacings > 50) break;
  }
  
  return maxFacings;
}

export function canAddNewProduct(
  productWidth: number,
  layerWidth: number,
  existingProducts: ShelfProduct[],
  productList: Product[]
): boolean {
  const usedWidth = existingProducts.reduce((sum, sp) => {
    const p = productList.find((prod) => prod.id === sp.productId);
    return sum + (p ? p.width * sp.facings : 0);
  }, 0);
  return (layerWidth - usedWidth) >= productWidth;
}
