import { StoreInfo, Product, Shelf, DisplayRule, Rectification, Photo } from '@/types';

export const mockStores: StoreInfo[] = [
  { id: 'store-1', name: '华润万家 南山店', address: '深圳市南山区科技园路 1 号', region: '华南区', score: 85 },
  { id: 'store-2', name: '沃尔玛 福田店', address: '深圳市福田区华强北路 88 号', region: '华南区', score: 72 },
  { id: 'store-3', name: '永辉超市 天河店', address: '广州市天河区中山大道 123 号', region: '华南区', score: 91 },
  { id: 'store-4', name: '家乐福 徐汇店', address: '上海市徐汇区肇嘉浜路 666 号', region: '华东区', score: 78 },
  { id: 'store-5', name: '大润发 朝阳店', address: '北京市朝阳区青年路 20 号', region: '华北区', score: 83 },
];

export const mockProducts: Product[] = [
  { id: 'p1', name: '可口可乐 330ml', category: '碳酸饮料', brand: '可口可乐', spec: '330ml*24', image: '', width: 1, height: 2, stock: 120, stockWarning: false, color: '#f40009' },
  { id: 'p2', name: '可口可乐 500ml', category: '碳酸饮料', brand: '可口可乐', spec: '500ml*24', image: '', width: 1, height: 3, stock: 85, stockWarning: false, color: '#f40009' },
  { id: 'p3', name: '雪碧 330ml', category: '碳酸饮料', brand: '可口可乐', spec: '330ml*24', image: '', width: 1, height: 2, stock: 95, stockWarning: false, color: '#00a650' },
  { id: 'p4', name: '芬达 橙味 330ml', category: '碳酸饮料', brand: '可口可乐', spec: '330ml*24', image: '', width: 1, height: 2, stock: 60, stockWarning: false, color: '#ff8c00' },
  { id: 'p5', name: '百事可乐 330ml', category: '碳酸饮料', brand: '百事', spec: '330ml*24', image: '', width: 1, height: 2, stock: 110, stockWarning: false, color: '#003da5' },
  { id: 'p6', name: '百事可乐 500ml', category: '碳酸饮料', brand: '百事', spec: '500ml*24', image: '', width: 1, height: 3, stock: 75, stockWarning: false, color: '#003da5' },
  { id: 'p7', name: '七喜 330ml', category: '碳酸饮料', brand: '百事', spec: '330ml*24', image: '', width: 1, height: 2, stock: 45, stockWarning: true, color: '#00a650' },
  { id: 'p8', name: '美年达 橙味 330ml', category: '碳酸饮料', brand: '百事', spec: '330ml*24', image: '', width: 1, height: 2, stock: 55, stockWarning: false, color: '#ff6b00' },
  { id: 'p9', name: '农夫山泉 550ml', category: '饮用水', brand: '农夫山泉', spec: '550ml*24', image: '', width: 1, height: 3, stock: 200, stockWarning: false, color: '#ff0000' },
  { id: 'p10', name: '怡宝 555ml', category: '饮用水', brand: '怡宝', spec: '555ml*24', image: '', width: 1, height: 3, stock: 180, stockWarning: false, color: '#00a0e9' },
  { id: 'p11', name: '百岁山 570ml', category: '饮用水', brand: '百岁山', spec: '570ml*24', image: '', width: 1, height: 3, stock: 150, stockWarning: false, color: '#0056a6' },
  { id: 'p12', name: '康师傅冰红茶 500ml', category: '茶饮料', brand: '康师傅', spec: '500ml*15', image: '', width: 1, height: 3, stock: 130, stockWarning: false, color: '#ff4d00' },
  { id: 'p13', name: '康师傅绿茶 500ml', category: '茶饮料', brand: '康师傅', spec: '500ml*15', image: '', width: 1, height: 3, stock: 100, stockWarning: false, color: '#008000' },
  { id: 'p14', name: '统一冰红茶 500ml', category: '茶饮料', brand: '统一', spec: '500ml*15', image: '', width: 1, height: 3, stock: 5, stockWarning: true, color: '#e60012' },
  { id: 'p15', name: '元气森林 白桃味 480ml', category: '气泡水', brand: '元气森林', spec: '480ml*15', image: '', width: 1, height: 3, stock: 90, stockWarning: false, color: '#ff69b4' },
  { id: 'p16', name: '元气森林 卡曼橘味 480ml', category: '气泡水', brand: '元气森林', spec: '480ml*15', image: '', width: 1, height: 3, stock: 70, stockWarning: false, color: '#ffa500' },
  { id: 'p17', name: '农夫果园 混合果蔬 500ml', category: '果汁', brand: '农夫山泉', spec: '500ml*15', image: '', width: 1, height: 3, stock: 65, stockWarning: false, color: '#ff6347' },
  { id: 'p18', name: '美汁源 果粒橙 450ml', category: '果汁', brand: '可口可乐', spec: '450ml*12', image: '', width: 1, height: 3, stock: 88, stockWarning: false, color: '#ffa500' },
  { id: 'p19', name: '旺仔牛奶 245ml', category: '乳饮料', brand: '旺旺', spec: '245ml*24', image: '', width: 1, height: 2, stock: 140, stockWarning: false, color: '#ff0000' },
  { id: 'p20', name: '营养快线 500ml', category: '乳饮料', brand: '娃哈哈', spec: '500ml*15', image: '', width: 1, height: 3, stock: 8, stockWarning: true, color: '#4169e1' },
];

export const mockShelves: Shelf[] = [
  {
    id: 'shelf-1',
    name: 'A区 主货架',
    type: 'normal',
    totalWidth: 12,
    layers: [
      { id: 'layer-1-1', height: 30, position: 0, products: [
        { productId: 'p1', position: 0, facings: 3 },
        { productId: 'p5', position: 3, facings: 3 },
        { productId: 'p9', position: 6, facings: 3 },
      ]},
      { id: 'layer-1-2', height: 40, position: 1, products: [
        { productId: 'p2', position: 0, facings: 2 },
        { productId: 'p6', position: 2, facings: 2 },
        { productId: 'p12', position: 4, facings: 3 },
        { productId: 'p15', position: 7, facings: 3 },
      ]},
      { id: 'layer-1-3', height: 35, position: 2, products: [
        { productId: 'p3', position: 0, facings: 2 },
        { productId: 'p7', position: 2, facings: 2 },
        { productId: 'p13', position: 4, facings: 2 },
        { productId: 'p18', position: 6, facings: 3 },
      ]},
      { id: 'layer-1-4', height: 25, position: 3, products: [
        { productId: 'p4', position: 0, facings: 3 },
        { productId: 'p8', position: 3, facings: 3 },
        { productId: 'p19', position: 6, facings: 4 },
      ]},
    ],
  },
  {
    id: 'shelf-2',
    name: 'B区 端架',
    type: 'end',
    totalWidth: 4,
    layers: [
      { id: 'layer-2-1', height: 30, position: 0, products: [
        { productId: 'p15', position: 0, facings: 4 },
      ]},
      { id: 'layer-2-2', height: 35, position: 1, products: [
        { productId: 'p16', position: 0, facings: 4 },
      ]},
      { id: 'layer-2-3', height: 30, position: 2, products: [
        { productId: 'p1', position: 0, facings: 4 },
      ]},
    ],
  },
  {
    id: 'shelf-3',
    name: 'C区 堆头',
    type: 'display',
    totalWidth: 6,
    layers: [
      { id: 'layer-3-1', height: 60, position: 0, products: [
        { productId: 'p9', position: 0, facings: 6 },
      ]},
    ],
  },
];

export const mockRules: DisplayRule[] = [
  {
    id: 'rule-1',
    type: 'adjacent_brand',
    description: '可口可乐与百事品牌商品不能相邻陈列',
    params: { brands: ['可口可乐', '百事'] },
    scoreWeight: 15,
  },
  {
    id: 'rule-2',
    type: 'must_have',
    description: '主货架黄金层（第二层）必须陈列可口可乐 500ml',
    params: { shelfType: 'normal', layerIndex: 1, productId: 'p2' },
    scoreWeight: 20,
  },
  {
    id: 'rule-3',
    type: 'facing_min',
    description: '核心商品排面数不少于 3 个',
    params: { productIds: ['p1', 'p2', 'p9'], minFacings: 3 },
    scoreWeight: 15,
  },
  {
    id: 'rule-4',
    type: 'forbidden_area',
    description: '堆头只能陈列饮用水和碳酸饮料',
    params: { shelfType: 'display', allowedCategories: ['饮用水', '碳酸饮料'] },
    scoreWeight: 10,
  },
  {
    id: 'rule-5',
    type: 'adjacent_brand',
    description: '元气森林不能与康师傅茶饮料相邻',
    params: { brands: ['元气森林', '康师傅'] },
    scoreWeight: 10,
  },
  {
    id: 'rule-6',
    type: 'facing_min',
    description: '端架商品需满排面陈列',
    params: { shelfType: 'end', minFillRate: 0.9 },
    scoreWeight: 10,
  },
];

export const mockRectifications: Rectification[] = [
  {
    id: 'rect-1',
    title: '第二层可口可乐排面不足',
    description: '标准陈列要求 3 个排面，当前只有 2 个，请补充库存并调整陈列',
    assignee: '张三',
    status: 'pending',
    priority: 'high',
    createdAt: '2024-01-15 09:30',
    dueDate: '2024-01-17 18:00',
    shelfId: 'shelf-1',
    ruleId: 'rule-3',
    layerId: 'layer-1-2',
    productId: 'p2',
  },
  {
    id: 'rect-2',
    title: '端架雪碧替换为新品',
    description: '本季度促销品更换为元气森林白桃味，请调整端架陈列',
    assignee: '李四',
    status: 'in_progress',
    priority: 'medium',
    createdAt: '2024-01-14 14:00',
    dueDate: '2024-01-16 12:00',
    shelfId: 'shelf-2',
  },
  {
    id: 'rect-3',
    title: '堆头整理',
    description: '堆头商品摆放不整齐，需要重新码放整齐',
    assignee: '王五',
    status: 'completed',
    priority: 'low',
    createdAt: '2024-01-13 10:00',
    dueDate: '2024-01-14 18:00',
    completedAt: '2024-01-14 16:30',
    shelfId: 'shelf-3',
    resolutionNote: '已重新码放整齐，堆头商品从堆底到堆顶统一方向陈列',
  },
];

export const mockPhotos: Photo[] = [
  {
    id: 'photo-1',
    url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=supermarket%20shelf%20with%20beverages%20coca%20cola%20sprite%20pepsi%20neatly%20arranged&image_size=landscape_16_9',
    name: '标准陈列图-A区',
    type: 'standard',
    shelfId: 'shelf-1',
    uploadTime: '2024-01-10 10:00',
  },
  {
    id: 'photo-2',
    url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=supermarket%20end%20cap%20display%20with%20soda%20drinks%20promotion&image_size=landscape_4_3',
    name: '标准陈列图-端架',
    type: 'standard',
    shelfId: 'shelf-2',
    uploadTime: '2024-01-10 10:05',
  },
];

export const categories = [
  '全部',
  '碳酸饮料',
  '饮用水',
  '茶饮料',
  '果汁',
  '气泡水',
  '乳饮料',
];

export const staffMembers = ['张三', '李四', '王五', '赵六', '孙七'];
