/**
 * 示例插画数据
 * 用于网站内容填充和功能演示
 */

export interface Artwork {
  id: string;
  title: string;
  artist_name: string;
  artist_id: string;
  image_url: string;
  thumbnail_url: string;
  tags: string[];
  description: string;
  view_count: number;
  like_count: number;
  created_at: string;
  rank?: number;
  score?: number;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author_name: string;
  featured_image: string;
  published_at: string;
  view_count: number;
  tags: string[];
}

/**
 * 生成示例插画数据
 * @returns 插画数据数组
 */
export const mockArtworks: Artwork[] = [
  {
    id: '1',
    title: '星空下的少女',
    artist_name: '月夜画师',
    artist_id: 'artist_1',
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=1600&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop',
    tags: ['少女', '星空', '夜景', '唯美'],
    description: '在璀璨星空下，一位少女静静地仰望着夜空，思考着人生的意义。',
    view_count: 15420,
    like_count: 2341,
    created_at: '2024-01-15T10:30:00Z',
    rank: 1,
    score: 9850
  },
  {
    id: '2',
    title: '樱花飞舞的春日',
    artist_name: '春风绘者',
    artist_id: 'artist_2',
    image_url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1200&h=1600&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400&h=600&fit=crop',
    tags: ['樱花', '春天', '粉色', '浪漫'],
    description: '粉色的樱花花瓣在春风中轻舞，营造出梦幻般的浪漫氛围。',
    view_count: 12890,
    like_count: 1987,
    created_at: '2024-01-14T14:20:00Z',
    rank: 2,
    score: 9720
  },
  {
    id: '3',
    title: '机械少女的梦境',
    artist_name: '未来画匠',
    artist_id: 'artist_3',
    image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=1600&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop',
    tags: ['机械', '科幻', '少女', '未来'],
    description: '在科技与人性交融的世界里，机械少女拥有着最纯真的梦想。',
    view_count: 18750,
    like_count: 3124,
    created_at: '2024-01-13T09:15:00Z',
    rank: 3,
    score: 9680
  },
  {
    id: '4',
    title: '海边的夕阳',
    artist_name: '海风画师',
    artist_id: 'artist_4',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=1600&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
    tags: ['海边', '夕阳', '风景', '温暖'],
    description: '金色的夕阳洒在海面上，波光粼粼，美得令人心醉。',
    view_count: 9876,
    like_count: 1456,
    created_at: '2024-01-12T18:45:00Z',
    rank: 4,
    score: 9520
  },
  {
    id: '5',
    title: '森林中的精灵',
    artist_name: '自然之笔',
    artist_id: 'artist_5',
    image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=1600&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=600&fit=crop',
    tags: ['森林', '精灵', '自然', '神秘'],
    description: '在古老的森林深处，精灵们守护着大自然的秘密。',
    view_count: 14230,
    like_count: 2187,
    created_at: '2024-01-11T12:30:00Z',
    rank: 5,
    score: 9450
  },
  {
    id: '6',
    title: '城市夜景',
    artist_name: '都市画家',
    artist_id: 'artist_6',
    image_url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&h=1600&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&h=600&fit=crop',
    tags: ['城市', '夜景', '霓虹', '现代'],
    description: '繁华都市的夜晚，霓虹灯光交织成一幅现代艺术画。',
    view_count: 11567,
    like_count: 1789,
    created_at: '2024-01-10T20:15:00Z',
    rank: 6,
    score: 9380
  },
  {
    id: '7',
    title: '雪山之巅',
    artist_name: '雪域画师',
    artist_id: 'artist_7',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=1600&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
    tags: ['雪山', '高峰', '壮丽', '纯净'],
    description: '巍峨的雪山直插云霄，展现着大自然的雄伟壮丽。',
    view_count: 8934,
    like_count: 1234,
    created_at: '2024-01-09T08:00:00Z',
    rank: 7,
    score: 9280
  },
  {
    id: '8',
    title: '古风美人',
    artist_name: '古韵画师',
    artist_id: 'artist_8',
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=1600&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop',
    tags: ['古风', '美人', '传统', '优雅'],
    description: '身着华服的古风美人，举手投足间尽显东方韵味。',
    view_count: 16789,
    like_count: 2876,
    created_at: '2024-01-08T16:20:00Z',
    rank: 8,
    score: 9180
  },
  {
    id: '9',
    title: '太空探索',
    artist_name: '星际画家',
    artist_id: 'artist_9',
    image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=1600&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop',
    tags: ['太空', '探索', '科幻', '未知'],
    description: '在浩瀚的宇宙中，人类永远保持着对未知的好奇与探索精神。',
    view_count: 13456,
    like_count: 2098,
    created_at: '2024-01-07T11:45:00Z',
    rank: 9,
    score: 9080
  },
  {
    id: '10',
    title: '花园小径',
    artist_name: '花语画师',
    artist_id: 'artist_10',
    image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=1600&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=600&fit=crop',
    tags: ['花园', '小径', '宁静', '美好'],
    description: '蜿蜒的花园小径两旁开满了各色鲜花，宁静而美好。',
    view_count: 10234,
    like_count: 1567,
    created_at: '2024-01-06T14:30:00Z',
    rank: 10,
    score: 8980
  }
];

/**
 * 生成示例文章数据
 * @returns 文章数据数组
 */
export const mockArticles: Article[] = [
  {
    id: '1',
    title: '探索日式插画的独特魅力',
    slug: 'japanese-illustration-charm',
    excerpt: '日式插画以其独特的美学风格和细腻的情感表达，在世界插画艺术中占据着重要地位。',
    content: '日式插画的魅力在于其对细节的极致追求和对情感的深度挖掘...',
    author_name: '艺术评论家',
    featured_image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop',
    published_at: '2024-01-15T10:00:00Z',
    view_count: 5678,
    tags: ['日式插画', '艺术分析', '美学']
  },
  {
    id: '2',
    title: '数字绘画技法入门指南',
    slug: 'digital-painting-guide',
    excerpt: '从传统绘画到数字艺术，这是一个技术与艺术完美结合的时代。',
    content: '数字绘画为艺术家提供了前所未有的创作自由度...',
    author_name: '数字艺术导师',
    featured_image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
    published_at: '2024-01-14T15:30:00Z',
    view_count: 4321,
    tags: ['数字绘画', '技法', '教程']
  },
  {
    id: '3',
    title: '色彩心理学在插画中的应用',
    slug: 'color-psychology-illustration',
    excerpt: '色彩不仅仅是视觉元素，更是情感传达的重要媒介。',
    content: '在插画创作中，色彩的选择和搭配直接影响着作品的情感表达...',
    author_name: '色彩理论专家',
    featured_image: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&h=400&fit=crop',
    published_at: '2024-01-13T12:15:00Z',
    view_count: 3987,
    tags: ['色彩理论', '心理学', '插画技巧']
  }
];

/**
 * 获取随机推荐插画
 * @param count 返回数量
 * @returns 随机插画数组
 */
export const getRandomArtworks = (count: number = 12): Artwork[] => {
  const shuffled = [...mockArtworks].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

/**
 * 获取排行榜数据
 * @param period 时间段
 * @returns 排行榜插画数组
 */
export const getRankingArtworks = (): Artwork[] => {
  // TODO: 根据时间段返回不同的排行榜数据
  return mockArtworks.slice(0, 10);
};

/**
 * 获取精选插画（用于首页轮播）
 * @returns 精选插画数组
 */
export const getFeaturedArtworks = (): Artwork[] => {
  return mockArtworks.slice(0, 5);
};