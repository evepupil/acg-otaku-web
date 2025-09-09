import { getArticleById, getAllArticleSlugs, getRelatedArticles } from '../../../src/lib/articles'
import ArticleDetailClient from './ArticleDetailClient'

/**
 * 生成静态参数用于 SSG
 */
export async function generateStaticParams() {
  const slugs = getAllArticleSlugs()
  return slugs.map((slug) => ({
    id: slug,
  }))
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const article = getArticleById(resolvedParams.id)
  
  if (!article) {
    return <div>文章未找到</div>
  }

  // 在服务器端获取相关文章
  const relatedArticles = getRelatedArticles(article.slug, 3)

  return <ArticleDetailClient article={article} relatedArticles={relatedArticles} />
}