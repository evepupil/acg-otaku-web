import Link from 'next/link'
import { CalendarDays, Hash, Image, Palette } from 'lucide-react'

import StatsCard from '@/components/admin/StatsCard'
import { getContentStats } from '@/lib/turso'

const quickActions = [
  {
    href: '/admin/artworks/add',
    label: '添加作品',
    icon: Image,
    className: 'bg-green-50 text-green-700 hover:bg-green-100',
    iconClassName: 'text-green-600',
  },
  {
    href: '/admin/daily-picks',
    label: '管理每日精选',
    icon: CalendarDays,
    className: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    iconClassName: 'text-blue-600',
  },
  {
    href: '/admin/artists',
    label: '管理画师专题',
    icon: Palette,
    className: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
    iconClassName: 'text-purple-600',
  },
  {
    href: '/admin/topics',
    label: '管理话题专题',
    icon: Hash,
    className: 'bg-orange-50 text-orange-700 hover:bg-orange-100',
    iconClassName: 'text-orange-600',
  },
] as const

const guideItems = [
  '先在作品管理里补充作品，再进入专题或精选配置内容。',
  '每日精选适合快速组织当日内容，专题页适合做长期沉淀。',
  '发布前先检查封面、标题、排序和编辑文案，避免前台展示断层。',
  '专题尽量保持主题清晰，减少同一页面里混入过多风格跳变的作品。',
] as const

export default async function AdminDashboard() {
  const stats = await getContentStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
        <p className="mt-1 text-gray-500">后台内容概览与常用入口</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="作品总数" value={stats.totalArtworks} icon={Image} color="green" />
        <StatsCard
          title="每日精选"
          value={stats.totalDailyPicks}
          subtitle={`已发布 ${stats.publishedDailyPicks}`}
          icon={CalendarDays}
          color="blue"
        />
        <StatsCard
          title="画师专题"
          value={stats.totalArtistFeatures}
          subtitle={`已发布 ${stats.publishedArtistFeatures}`}
          icon={Palette}
          color="purple"
        />
        <StatsCard
          title="话题专题"
          value={stats.totalTopicFeatures}
          subtitle={`已发布 ${stats.publishedTopicFeatures}`}
          icon={Hash}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">快捷操作</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon

              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`flex items-center gap-3 rounded-xl p-4 transition-colors ${action.className}`}
                >
                  <Icon className={`h-5 w-5 ${action.iconClassName}`} />
                  <span className="text-sm font-medium">{action.label}</span>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">运营提醒</h2>
          <div className="space-y-3 text-sm leading-6 text-gray-600">
            {guideItems.map((item, index) => (
              <p key={item}>
                {index + 1}. {item}
              </p>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
