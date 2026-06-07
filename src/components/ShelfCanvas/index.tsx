import { useState, useRef, useEffect } from 'react';
import { Layers, Plus, Trash2, Settings, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { findNearestPosition, getShelfTypeLabel, calculateLayerFillRate, getMaxFacingsForProduct, canAddNewProduct, canPlaceProduct } from '@/utils';
import { cn } from '@/lib/utils';
import { Product, ShelfLayer } from '@/types';

interface ShelfProductItemProps {
  product: Product;
  facings: number;
  position: number;
  layerWidth: number;
  unitWidth: number;
  onDragStart: (e: React.DragEvent, productId: string) => void;
  onRemove: () => void;
  onFacingsChange: (facings: number) => void;
}

function ShelfProductItem({
  product,
  facings,
  position,
  unitWidth,
  onDragStart,
  onRemove,
  onFacingsChange,
}: ShelfProductItemProps) {
  const [showControls, setShowControls] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, product.id)}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      className="absolute top-1 bottom-1 rounded-md flex flex-col items-center justify-center text-white font-medium cursor-move transition-all group"
      style={{
        left: `${position * unitWidth}px`,
        width: `${facings * unitWidth - 4}px`,
        backgroundColor: product.color,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      <div className="text-xs font-bold truncate px-1 text-center w-full">
        {product.name.split(' ')[0]}
      </div>
      <div className="text-[10px] opacity-80 mt-0.5">{facings}排面</div>

      {showControls && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white rounded-lg shadow-lg p-1 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onFacingsChange(Math.max(1, facings - 1)); }}
            className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded text-sm"
          >
            -
          </button>
          <span className="text-xs text-gray-700 w-6 text-center">{facings}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onFacingsChange(facings + 1); }}
            className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded text-sm"
          >
            +
          </button>
          <div className="w-px h-4 bg-gray-200 mx-0.5" />
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="w-6 h-6 flex items-center justify-center text-red-500 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

interface LayerRowProps {
  layer: ShelfLayer;
  shelfId: string;
  shelfType: string;
  totalWidth: number;
  unitWidth: number;
  products: Product[];
  isSelected: boolean;
  onSelect: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  isDragOver: boolean;
  onProductDragStart: (e: React.DragEvent, productId: string) => void;
  onRemoveProduct: (productId: string) => void;
  onUpdateFacings: (productId: string, facings: number) => void;
  onHeightChange: (height: number) => void;
}

function LayerRow({
  layer,
  totalWidth,
  unitWidth,
  products,
  isSelected,
  onSelect,
  onDrop,
  onDragOver,
  onDragLeave,
  isDragOver,
  onProductDragStart,
  onRemoveProduct,
  onUpdateFacings,
  onHeightChange,
}: LayerRowProps) {
  const fillRate = calculateLayerFillRate(layer, totalWidth, products);

  return (
    <div
      onClick={onSelect}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={cn(
        "relative border-2 rounded-lg mx-4 my-2 transition-all cursor-pointer",
        isSelected ? "border-blue-500 bg-blue-50/30" : "border-gray-300 bg-gradient-to-b from-gray-50 to-gray-100",
        isDragOver && "border-blue-400 bg-blue-50/50 scale-[1.01]"
      )}
      style={{ height: `${layer.height * 1.5 + 20}px` }}
    >
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-gray-400 to-gray-300 rounded-b-md" />

      {layer.products.map((sp) => {
        const product = products.find((p) => p.id === sp.productId);
        if (!product) return null;
        return (
          <ShelfProductItem
            key={sp.productId}
            product={product}
            facings={sp.facings}
            position={sp.position}
            layerWidth={totalWidth}
            unitWidth={unitWidth}
            onDragStart={onProductDragStart}
            onRemove={() => onRemoveProduct(sp.productId)}
            onFacingsChange={(f) => onUpdateFacings(sp.productId, f)}
          />
        );
      })}

      <div className="absolute -left-1 top-1/2 -translate-y-1/2 -translate-x-full pr-2">
        <div className="text-xs text-gray-500 whitespace-nowrap">
          第{layer.position + 1}层
        </div>
        <div className="text-[10px] text-gray-400">
          {layer.height}cm
        </div>
      </div>

      {isSelected && (
        <div className="absolute -right-1 top-1/2 -translate-y-1/2 translate-x-full pl-2 flex flex-col gap-1">
          <input
            type="range"
            min="15"
            max="80"
            value={layer.height}
            onChange={(e) => onHeightChange(Number(e.target.value))}
            className="w-16 h-1 accent-blue-600"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="absolute bottom-3 right-3 text-[10px] text-gray-400">
        填充率: {Math.round(fillRate * 100)}%
      </div>
    </div>
  );
}

export function ShelfCanvas() {
  const {
    shelves,
    currentShelfId,
    products,
    setCurrentShelf,
    addProductToLayer,
    removeProductFromLayer,
    moveProductInLayer,
    updateProductFacings,
    updateLayerHeight,
    addLayer,
    removeLayer,
    violations,
  } = useAppStore();

  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [dragOverLayerId, setDragOverLayerId] = useState<string | null>(null);
  const [draggedProductId, setDraggedProductId] = useState<string | null>(null);
  const [dragSource, setDragSource] = useState<'library' | 'shelf' | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const unitWidth = 50;

  const currentShelf = shelves.find((s) => s.id === currentShelfId);
  const currentShelfIndex = shelves.findIndex((s) => s.id === currentShelfId);

  useEffect(() => {
    if (currentShelf && currentShelf.layers.length > 0 && !selectedLayerId) {
      setSelectedLayerId(currentShelf.layers[0].id);
    }
  }, [currentShelfId, currentShelf, selectedLayerId]);

  const handlePrevShelf = () => {
    if (currentShelfIndex > 0) {
      setCurrentShelf(shelves[currentShelfIndex - 1].id);
      setSelectedLayerId(null);
    }
  };

  const handleNextShelf = () => {
    if (currentShelfIndex < shelves.length - 1) {
      setCurrentShelf(shelves[currentShelfIndex + 1].id);
      setSelectedLayerId(null);
    }
  };

  const handleDragOver = (e: React.DragEvent, layerId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = dragSource === 'library' ? 'copy' : 'move';
    setDragOverLayerId(layerId);
  };

  const handleDragLeave = () => {
    setDragOverLayerId(null);
  };

  const handleDrop = (e: React.DragEvent, layerId: string) => {
    e.preventDefault();
    setDragOverLayerId(null);

    const productId = e.dataTransfer.getData('productId');
    const source = e.dataTransfer.getData('source');
    if (!productId || !currentShelf) return;

    const layer = currentShelf.layers.find((l) => l.id === layerId);
    if (!layer) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const position = Math.floor(x / unitWidth);

    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (source === 'library') {
      const facings = 1;
      
      if (!canAddNewProduct(product.width, currentShelf.totalWidth, layer.products, products)) {
        return;
      }
      
      const newPosition = findNearestPosition(
        position,
        product.width,
        facings,
        currentShelf.totalWidth,
        layer.products,
        products
      );
      
      if (canPlaceProduct(product.width, facings, newPosition, currentShelf.totalWidth, layer.products, products)) {
        addProductToLayer(currentShelfId, layerId, productId, newPosition, facings);
      }
    } else if (source === 'shelf') {
      const sp = layer.products.find((p) => p.productId === productId);
      if (!sp) return;

      const newPosition = findNearestPosition(
        position,
        product.width,
        sp.facings,
        currentShelf.totalWidth,
        layer.products,
        products,
        productId
      );
      moveProductInLayer(currentShelfId, layerId, productId, newPosition);
    }

    setDraggedProductId(null);
    setDragSource(null);
  };

  const handleProductDragStart = (e: React.DragEvent, productId: string) => {
    e.dataTransfer.setData('productId', productId);
    e.dataTransfer.setData('source', 'shelf');
    e.dataTransfer.effectAllowed = 'move';
    setDraggedProductId(productId);
    setDragSource('shelf');
  };

  const handleRemoveProduct = (layerId: string, productId: string) => {
    removeProductFromLayer(currentShelfId, layerId, productId);
  };

  const handleUpdateFacings = (layerId: string, productId: string, newFacings: number) => {
    if (!currentShelf) return;
    
    const layer = currentShelf.layers.find(l => l.id === layerId);
    const product = products.find(p => p.id === productId);
    const sp = layer?.products.find(p => p.productId === productId);
    
    if (!layer || !product || !sp) return;
    
    const maxFacings = getMaxFacingsForProduct(
      productId,
      product.width,
      sp.facings,
      sp.position,
      currentShelf.totalWidth,
      layer.products,
      products
    );
    
    const finalFacings = Math.min(Math.max(1, newFacings), maxFacings);
    updateProductFacings(currentShelfId, layerId, productId, finalFacings);
  };

  const handleHeightChange = (layerId: string, height: number) => {
    updateLayerHeight(currentShelfId, layerId, height);
  };

  const handleAddLayer = () => {
    addLayer(currentShelfId);
  };

  const handleRemoveLayer = () => {
    if (selectedLayerId) {
      removeLayer(currentShelfId, selectedLayerId);
      setSelectedLayerId(null);
    }
  };

  const layerViolations = (layerId: string) => {
    return violations.filter((v) => v.layerId === layerId);
  };

  if (!currentShelf) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>暂无货架数据</p>
        </div>
      </div>
    );
  }

  const canvasWidth = currentShelf.totalWidth * unitWidth + 80;

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevShelf}
            disabled={currentShelfIndex === 0}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              {currentShelf.name}
            </div>
            <div className="text-xs text-gray-500">
              {getShelfTypeLabel(currentShelf.type)} · {currentShelf.layers.length} 层 · 宽 {currentShelf.totalWidth} 排面
            </div>
          </div>
          <button
            onClick={handleNextShelf}
            disabled={currentShelfIndex === shelves.length - 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddLayer}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            添加层板
          </button>
          <button
            onClick={handleRemoveLayer}
            disabled={!selectedLayerId || currentShelf.layers.length <= 1}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
            删除层板
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
            <Settings className="w-3.5 h-3.5" />
            货架设置
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex items-center justify-center p-6" ref={canvasRef}>
        <div
          className="bg-white rounded-xl shadow-xl p-6 relative"
          style={{ width: `${canvasWidth}px`, minWidth: `${canvasWidth}px` }}
        >
          <div className="bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 h-8 rounded-t-lg -mx-6 -mt-6 mb-4 flex items-center justify-center">
            <span className="text-xs text-gray-500 font-medium">{currentShelf.name} 顶视图</span>
          </div>

          {[...currentShelf.layers].reverse().map((layer) => (
            <LayerRow
              key={layer.id}
              layer={layer}
              shelfId={currentShelf.id}
              shelfType={currentShelf.type}
              totalWidth={currentShelf.totalWidth}
              unitWidth={unitWidth}
              products={products}
              isSelected={selectedLayerId === layer.id}
              onSelect={() => setSelectedLayerId(layer.id)}
              onDrop={(e) => handleDrop(e, layer.id)}
              onDragOver={(e) => handleDragOver(e, layer.id)}
              onDragLeave={handleDragLeave}
              isDragOver={dragOverLayerId === layer.id}
              onProductDragStart={handleProductDragStart}
              onRemoveProduct={(pid) => handleRemoveProduct(layer.id, pid)}
              onUpdateFacings={(pid, f) => handleUpdateFacings(layer.id, pid, f)}
              onHeightChange={(h) => handleHeightChange(layer.id, h)}
            />
          ))}

          <div className="bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 h-6 rounded-b-lg -mx-6 -mb-6 mt-4" />

          {selectedLayerId && layerViolations(selectedLayerId).length > 0 && (
            <div className="absolute bottom-10 left-6 right-6 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-xs font-medium text-red-700 mb-1">当前层板违规</div>
              {layerViolations(selectedLayerId).map((v, i) => (
                <div key={i} className="text-xs text-red-600 flex items-start gap-1">
                  <span className="text-red-400">•</span>
                  {v.description}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="h-10 bg-white border-t border-gray-200 flex items-center justify-between px-4">
        <div className="text-xs text-gray-500">
          提示：从左侧商品库拖拽商品到货架上进行陈列
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-400" /> 填充正常
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-amber-400" /> 填充不足
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-400" /> 违规陈列
          </span>
        </div>
      </div>
    </div>
  );
}
