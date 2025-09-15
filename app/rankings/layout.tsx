import { Metadata } from 'next'
import { rankingsMetadata } from '../metadata'

/**
 * 排行榜页面元数据
 */
export const metadata: Metadata = rankingsMetadata

/**
 * 排行榜页面布局
 * @param children 子组件
 * @returns JSX元素
 */
function RankingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

export default RankingsLayout