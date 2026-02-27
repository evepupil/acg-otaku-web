import { Metadata } from 'next'
import { recommendationsMetadata } from '../metadata'

/**
 * 推荐页面元数据
 */
export const metadata: Metadata = recommendationsMetadata

/**
 * 推荐页面布局
 * @param children 子组件
 * @returns JSX元素
 */
function RecommendationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

export default RecommendationsLayout