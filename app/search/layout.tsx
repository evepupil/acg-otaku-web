import { Metadata } from 'next'
import { searchMetadata } from '../metadata'

/**
 * 搜图页面元数据
 */
export const metadata: Metadata = searchMetadata

/**
 * 搜图页面布局
 * @param children 子组件
 * @returns JSX元素
 */
function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

export default SearchLayout