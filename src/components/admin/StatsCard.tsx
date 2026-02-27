import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number
  subtitle?: string
  icon: LucideIcon
  color: 'green' | 'blue' | 'purple' | 'orange'
}

const colorMap = {
  green: 'from-green-500 to-emerald-600 bg-green-50 text-green-700',
  blue: 'from-blue-500 to-cyan-600 bg-blue-50 text-blue-700',
  purple: 'from-purple-500 to-violet-600 bg-purple-50 text-purple-700',
  orange: 'from-orange-500 to-amber-600 bg-orange-50 text-orange-700',
}

export default function StatsCard({ title, value, subtitle, icon: Icon, color }: StatsCardProps) {
  const colors = colorMap[color]
  const [gradientColors, bgColor, textColor] = [
    colors.split(' ').slice(0, 2).join(' '),
    colors.split(' ')[2],
    colors.split(' ')[3],
  ]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</p>
          {subtitle && <p className={`text-sm mt-1 ${textColor}`}>{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${gradientColors} flex items-center justify-center ${bgColor}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}
