import { ExternalLink } from 'lucide-react'

interface ArtistProfileCardProps {
  artistName: string
  artistBio: string
  artistAvatar: string
  pixivUrl: string
  twitterUrl: string
}

export default function ArtistProfileCard({ artistName, artistBio, artistAvatar, pixivUrl, twitterUrl }: ArtistProfileCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
      {/* 头像 */}
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-violet-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {artistAvatar ? (
          <img src={artistAvatar} alt={artistName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl font-bold text-purple-600">{artistName.charAt(0)}</span>
        )}
      </div>

      {/* 信息 */}
      <div className="flex-1 text-center sm:text-left">
        <h2 className="text-2xl font-bold text-gray-900">{artistName}</h2>
        {artistBio && <p className="text-gray-600 mt-2 leading-relaxed">{artistBio}</p>}

        {/* 链接 */}
        <div className="flex items-center gap-3 mt-4 justify-center sm:justify-start">
          {pixivUrl && (
            <a href={pixivUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
              Pixiv
            </a>
          )}
          {twitterUrl && (
            <a href={twitterUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-600 rounded-lg text-sm hover:bg-sky-100 transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
              Twitter
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
