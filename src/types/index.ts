/**
 * 项目全局类型定义
 * 包含插画、文章、用户等核心数据类型
 */

// 基础响应类型
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 分页信息类型
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// 插画作品类型
export interface Artwork {
  id: number
  title: string
  artist: Artist
  imageUrl: string
  imagePath?: string  // B2 存储桶图片路径，用于优先访问
  thumbnailUrl?: string
  description?: string
  tags: string[]
  createdAt: string
  updatedAt?: string
  rank?: number
  category?: string
  width?: number
  height?: number
  fileSize?: number
  isNsfw?: boolean
  stats: {
    views: number
    likes: number
    bookmarks: number
  }
  software?: string
  dimensions?: {
    width: number
    height: number
  }
}

// 画师信息类型
export interface Artist {
  id: number
  name: string
  displayName?: string
  avatar?: string
  bio?: string
  website?: string
  socialLinks?: {
    twitter?: string
    pixiv?: string
    instagram?: string
  }
  followerCount?: number
  artworkCount?: number
  joinDate?: string
  isVerified?: boolean
  followers?: number
  following?: number
}

// 文章类型
export interface Article {
  id: number
  title: string
  author: Artist
  coverImage: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  publishDate: string
  readTime: number
  views: number
  likes: number
  isPublished?: boolean
  slug?: string
}

// 排行榜类型
export interface RankingData {
  rankings: Artwork[]
  pagination: Pagination
  period: 'daily' | 'weekly' | 'monthly'
}

// 推荐数据类型
export interface RecommendationData {
  recommendations: (Artwork & {
    recommendReason?: string
    score?: number
  })[]
  pagination: Pagination
  category: string
  timestamp: string
}

// 文章列表数据类型
export interface ArticleListData {
  articles: Article[]
  pagination: Pagination
  categories: string[]
  filters: {
    category: string
    search: string
  }
}

// 搜索参数类型
export interface SearchParams {
  query?: string
  category?: string
  tags?: string[]
  sortBy?: 'popularity' | 'date' | 'views' | 'likes'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// 用户行为记录类型
export interface UserAction {
  action: 'view' | 'like' | 'bookmark' | 'share' | 'download'
  itemId: number
  itemType: 'artwork' | 'article'
  userId?: string
  timestamp: string
  metadata?: Record<string, unknown>
}

// 导航菜单项类型
export interface NavItem {
  label: string
  href: string
  icon?: string
  isActive?: boolean
  children?: NavItem[]
}

// 主题配置类型
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system'
  primaryColor: string
  accentColor: string
  borderRadius: number
  fontFamily: string
}

// 组件Props基础类型
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

// 卡片组件Props类型
export interface CardProps extends BaseComponentProps {
  title?: string
  description?: string
  image?: string
  href?: string
  onClick?: () => void
  variant?: 'default' | 'glass' | 'outlined'
  size?: 'sm' | 'md' | 'lg'
}

// 按钮组件Props类型
export interface ButtonProps extends BaseComponentProps {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  type?: 'button' | 'submit' | 'reset'
}

// 输入框组件Props类型
export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'search' | 'number'
  placeholder?: string
  value?: string
  defaultValue?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
  disabled?: boolean
  required?: boolean
  error?: string
}

// 模态框组件Props类型
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
}

// 加载状态类型
export interface LoadingState {
  isLoading: boolean
  error?: string | null
  data?: unknown
}

// 表单验证类型
export interface FormValidation {
  isValid: boolean
  errors: Record<string, string>
  touched: Record<string, boolean>
}

// 动画配置类型
export interface AnimationConfig {
  duration?: number
  delay?: number
  easing?: string
  repeat?: number
  direction?: 'normal' | 'reverse' | 'alternate'
}

// 响应式断点类型
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

// 颜色主题类型
export type ColorTheme = {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  muted: string
  border: string
}

// 所有类型已在定义时导出，无需重复导出