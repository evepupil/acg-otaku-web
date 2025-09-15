import { Metadata } from 'next'
import { articlesMetadata } from '../metadata'

/**
 * 文章鉴赏页面元数据
 */
export const metadata: Metadata = articlesMetadata

/**
 * 文章鉴赏页面布局
 * @param children 子组件
 * @returns JSX元素
 */
function ArticlesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

export default ArticlesLayout