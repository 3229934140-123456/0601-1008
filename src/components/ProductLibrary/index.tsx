import { useMemo } from 'react';
import { Search, Package, AlertTriangle, Grid, List } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { categories } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onDragStart: (e: React.DragEvent, product: Product) => void;
}

function ProductCard({ product, onDragStart }: ProductCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, product)}
      className="bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-blue-300 transition-all group"
    >
      <div
        className="w-full h-16 rounded-md mb-2 flex items-center justify-center text-white font-bold text-xs relative"
        style={{ backgroundColor: product.color }}
      >
        <span className="truncate px-2">{product.name.split(' ')[0]}</span>
        {product.stockWarning && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      <div className="text-xs font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
        {product.name}
      </div>
      <div className="text-xs text-gray-500 mt-1">{product.spec}</div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-400">库存: {product.stock}</span>
        <span className="text-xs text-gray-400">{product.width}排面宽</span>
      </div>
    </div>
  );
}

export function ProductLibrary() {
  const { products, selectedCategory, searchKeyword, setSelectedCategory, setSearchKeyword } = useAppStore();

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = selectedCategory === '全部' || p.category === selectedCategory;
      const matchKeyword = !searchKeyword || p.name.includes(searchKeyword) || p.brand.includes(searchKeyword);
      return matchCategory && matchKeyword;
    });
  }, [products, selectedCategory, searchKeyword]);

  const handleDragStart = (e: React.DragEvent, product: Product) => {
    e.dataTransfer.setData('productId', product.id);
    e.dataTransfer.setData('source', 'library');
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="w-72 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Package className="w-4 h-4 text-blue-600" />
          商品库
        </h2>
        <div className="mt-3 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜索商品名称/品牌..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
          />
        </div>
      </div>

      <div className="p-3 border-b border-gray-200 bg-white">
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-2.5 py-1 text-xs rounded-full transition-all",
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-2">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onDragStart={handleDragStart} />
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
            没有找到相关商品
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>共 {filteredProducts.length} 个商品</span>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded hover:bg-gray-100 text-blue-600">
              <Grid className="w-4 h-4" />
            </button>
            <button className="p-1 rounded hover:bg-gray-100 text-gray-400">
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
