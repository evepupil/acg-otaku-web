export type CurationMode = 'daily' | 'topic' | 'artist'

export interface CurationArtworkSource {
  id: number
  title: string
  artist: {
    id: number
    name: string
    avatar?: string
  }
  imageUrl: string
  imagePath?: string
  tags: string[]
  createdAt: string
  stats: {
    views: number
    likes: number
    bookmarks: number
  }
}

interface TagInsight {
  key: string
  label: string
  count: number
}

interface TagSummary {
  topTags: TagInsight[]
  characterTags: string[]
  sceneTags: string[]
  styleTags: string[]
  artistCount: number
}

interface DailyContentInput {
  pickDate: string
  artworks: CurationArtworkSource[]
}

interface TopicContentInput {
  topicName: string
  artworks: CurationArtworkSource[]
}

interface ArtistContentInput {
  artistName: string
  artworks: CurationArtworkSource[]
}

interface GeneratedCurationContent {
  artworkCommentsByPid: Record<string, string>
}

interface ArtworkCommentInput {
  artwork: CurationArtworkSource
  artworks?: CurationArtworkSource[]
  mode: CurationMode
  topicName?: string
  artistName?: string
}

export interface GeneratedDailyPickContent extends GeneratedCurationContent {
  title: string
  description: string
}

export interface GeneratedTopicFeatureContent extends GeneratedCurationContent {
  topicDescription: string
  featureContent: string
  tags: string
}

export interface GeneratedArtistFeatureContent extends GeneratedCurationContent {
  featureTitle: string
  featureContent: string
}

const STOP_TAG_EXACT = new Set([
  'ai',
  'aiart',
  'aiイラスト',
  'ai生成',
  'illustration',
  'illust',
  'original',
  'pixiv',
  'r18',
  'r18g',
  'r-18',
  'r-18g',
  'イラスト',
  'オリジナル',
  '创作',
  '原创',
  '插画',
])

const STOP_TAG_PATTERNS = [
  /^\d+users入り$/i,
  /^\d+user入り$/i,
  /^users入り$/i,
  /^ブックマーク\d+$/i,
  /ブックマーク/i,
  /ranking/i,
  /ランキング/i,
]

const TAG_ALIAS_GROUPS: Array<{ label: string; aliases: string[] }> = [
  { label: '少女', aliases: ['女の子', 'girl', 'girls', '女孩', '女生', '少女'] },
  { label: '少年', aliases: ['男の子', 'boy', 'boys', '男孩', '男生', '少年'] },
  { label: '长发', aliases: ['ロングヘア', 'longhair', 'long hair', '長髪', '长发'] },
  { label: '短发', aliases: ['ショートヘア', 'shorthair', 'short hair', '短髪', '短发'] },
  { label: '白发', aliases: ['白髪', 'whitehair', 'white hair', '白发'] },
  { label: '黑发', aliases: ['黒髪', 'blackhair', 'black hair', '黑发'] },
  { label: '金发', aliases: ['金髪', 'blonde', 'blondehair', 'blonde hair', '金发'] },
  { label: '双马尾', aliases: ['ツインテール', 'twintails', 'twin tails', '双马尾'] },
  { label: '兽耳', aliases: ['ケモ耳', '獣耳', 'animalears', 'animal ears', '兽耳'] },
  { label: '制服', aliases: ['schooluniform', 'school uniform', '制服'] },
  { label: '和服', aliases: ['着物', 'kimono', '和服'] },
  { label: '泳装', aliases: ['水着', 'swimsuit', '泳装'] },
  { label: '眼镜', aliases: ['megane', 'glasses', '眼鏡', '眼镜'] },
  { label: '天空', aliases: ['sky', '青空', '空', '天空'] },
  { label: '海边', aliases: ['sea', 'beach', 'ocean', '海', '海辺', '海边'] },
  { label: '夜景', aliases: ['night', 'nightview', 'night view', '夜景', '夜空'] },
  { label: '樱花', aliases: ['桜', 'sakura', 'cherryblossom', 'cherry blossom', '樱花'] },
  { label: '雨景', aliases: ['rain', '雨', '雨景'] },
  { label: '光影', aliases: ['lighting', 'light', '光', '光影'] },
  { label: '氛围感', aliases: ['mood', 'atmosphere', '雰囲気', '氛围感'] },
  { label: '壁纸', aliases: ['wallpaper', '壁紙', '壁纸'] },
  { label: '头像', aliases: ['icon', 'profile', 'avatar', '头像'] },
]

const CHARACTER_KEYWORDS = [
  '少女',
  '少年',
  '长发',
  '短发',
  '白发',
  '黑发',
  '金发',
  '双马尾',
  '兽耳',
  '制服',
  '和服',
  '泳装',
  '眼镜',
  '兔女郎',
  '女仆',
  'jk',
  'ol',
]

const SCENE_KEYWORDS = [
  '天空',
  '海边',
  '夜景',
  '樱花',
  '雨景',
  '雪',
  '城市',
  '街道',
  '教室',
  '室内',
  '窗边',
  '森林',
  '花海',
  '风景',
  '夕阳',
]

const STYLE_KEYWORDS = [
  '光影',
  '氛围感',
  '壁纸',
  '头像',
  '厚涂',
  '水彩',
  '赛璐璐',
  '电影感',
  '高对比',
  '低饱和',
  '色彩',
]

const TAG_ALIAS_MAP = new Map<string, string>(
  TAG_ALIAS_GROUPS.flatMap((group) =>
    group.aliases.map((alias) => [normalizeTagKey(alias), group.label] as const)
  )
)

function normalizeTagKey(value: string) {
  return value
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/^#+/, '')
    .replace(/[()[\]{}<>]/g, '')
    .replace(/[!！?？,，.。:：/／\\|·・'"`~]/g, '')
    .replace(/[\s_-]+/g, '')
}

function sanitizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function normalizeTagLabel(tag: string) {
  const display = sanitizeText(tag)
  if (!display) {
    return null
  }

  const key = normalizeTagKey(display)
  if (!key) {
    return null
  }

  if (STOP_TAG_EXACT.has(key) || STOP_TAG_PATTERNS.some((pattern) => pattern.test(key))) {
    return null
  }

  const alias = TAG_ALIAS_MAP.get(key)
  if (alias) {
    return { key: normalizeTagKey(alias), label: alias }
  }

  if (key.includes('longhair') || key.includes('ロング')) {
    return { key: normalizeTagKey('长发'), label: '长发' }
  }

  if (key.includes('shorthair') || key.includes('ショート')) {
    return { key: normalizeTagKey('短发'), label: '短发' }
  }

  if (key.includes('whitehair') || key.includes('白髪')) {
    return { key: normalizeTagKey('白发'), label: '白发' }
  }

  if (key.includes('blackhair') || key.includes('黒髪')) {
    return { key: normalizeTagKey('黑发'), label: '黑发' }
  }

  if (key.includes('twintail') || key.includes('ツインテール')) {
    return { key: normalizeTagKey('双马尾'), label: '双马尾' }
  }

  if (key.includes('lighting') || key.includes('light')) {
    return { key: normalizeTagKey('光影'), label: '光影' }
  }

  if (display.length > 20) {
    return null
  }

  return { key, label: display }
}

function collectTagSummary(artworks: CurationArtworkSource[]): TagSummary {
  const counters = new Map<string, TagInsight>()
  const artistIds = new Set<string>()

  for (const artwork of artworks) {
    artistIds.add(String(artwork.artist?.id ?? '0'))

    const uniqueTags = new Set<string>()
    for (const tag of artwork.tags) {
      const normalized = normalizeTagLabel(tag)
      if (!normalized || uniqueTags.has(normalized.key)) {
        continue
      }
      uniqueTags.add(normalized.key)

      const existing = counters.get(normalized.key)
      if (existing) {
        existing.count += 1
      } else {
        counters.set(normalized.key, {
          key: normalized.key,
          label: normalized.label,
          count: 1,
        })
      }
    }
  }

  const sorted = Array.from(counters.values()).sort((left, right) => {
    if (right.count !== left.count) {
      return right.count - left.count
    }
    return left.label.localeCompare(right.label, 'zh-Hans-CN')
  })

  const pickCategoryTags = (keywords: string[]) =>
    sorted
      .filter((item) => keywords.some((keyword) => item.label.includes(keyword)))
      .slice(0, 3)
      .map((item) => item.label)

  return {
    topTags: sorted.slice(0, 8),
    characterTags: pickCategoryTags(CHARACTER_KEYWORDS),
    sceneTags: pickCategoryTags(SCENE_KEYWORDS),
    styleTags: pickCategoryTags(STYLE_KEYWORDS),
    artistCount: artistIds.size,
  }
}

function joinReadableLabels(values: string[], limit = values.length) {
  return values.slice(0, limit).join('、')
}

function formatDisplayDate(pickDate: string) {
  const matched = /^(\d{4})-(\d{2})-(\d{2})$/.exec(pickDate)
  if (!matched) {
    return pickDate
  }

  return `${Number(matched[2])}月${Number(matched[3])}日`
}

function getFallbackFocus(artwork: CurationArtworkSource) {
  if (artwork.title && artwork.title.trim()) {
    return '主体表现'
  }

  return '画面氛围'
}

function getArtworkFocusTags(artwork: CurationArtworkSource, summary: TagSummary) {
  const normalized = artwork.tags
    .map((tag) => normalizeTagLabel(tag))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  const seen = new Set<string>()
  const unique = normalized.filter((item) => {
    if (seen.has(item.key)) {
      return false
    }
    seen.add(item.key)
    return true
  })

  const topKeySet = new Set(summary.topTags.map((item) => item.key))
  const prioritized = [
    ...unique.filter((item) => topKeySet.has(item.key)),
    ...unique.filter((item) => !topKeySet.has(item.key)),
  ]

  const labels = prioritized.slice(0, 2).map((item) => item.label)
  return labels.length > 0 ? labels : [getFallbackFocus(artwork)]
}

function buildArtworkComment(
  artwork: CurationArtworkSource,
  summary: TagSummary,
  input: Omit<ArtworkCommentInput, 'artwork' | 'artworks'>
) {
  const focusTags = getArtworkFocusTags(artwork, summary)
  const focusText = focusTags.join('、')
  const variantSeed = Number(String(artwork.id).slice(-2)) % 4

  if (input.mode === 'topic') {
    const topicName = input.topicName || '当前专题'
    const templates = [
      `这张作品把 ${focusText} 放在同一画面里，和「${topicName}」专题的方向贴合度很高，适合作为本组内容里的代表图。`,
      `画面重点落在 ${focusText} 上，主题表达直接，放进「${topicName}」这一组里辨识度比较高。`,
      `这张图在 ${focusText} 上的信息更集中，既能体现「${topicName}」的核心元素，也方便读者快速抓住专题重点。`,
      `围绕 ${focusText} 展开的视觉信息比较完整，和「${topicName}」专题强调的内容形成了稳定呼应。`,
    ]
    return templates[variantSeed]
  }

  if (input.mode === 'artist') {
    const artistName = input.artistName || artwork.artist?.name || '这位画师'
    const templates = [
      `这张作品把 ${focusText} 放在同一画面里，能比较直接地体现 ${artistName} 在角色与氛围处理上的稳定风格。`,
      `画面重点落在 ${focusText} 上，构图和情绪都很集中，适合作为观察 ${artistName} 个人表达的一张代表作。`,
      `这张图在 ${focusText} 上的处理更完整，能够帮助读者快速理解 ${artistName} 这一组作品的审美方向。`,
      `围绕 ${focusText} 展开的视觉信息比较充分，和 ${artistName} 这组作品里反复出现的气质形成了连贯呼应。`,
    ]
    return templates[variantSeed]
  }

  const templates = [
    `这张作品把 ${focusText} 放在同一画面里，角色情绪和视觉重心都比较明确，适合作为本期精选里的代表图。`,
    `画面重点落在 ${focusText} 上，构图节奏干净，浏览时很容易留下记忆点。`,
    `这张图在 ${focusText} 上的表达更集中，既能体现本期审美方向，也适合作为整组内容里的亮点补充。`,
    `围绕 ${focusText} 展开的视觉信息比较完整，色彩和主体关系清楚，放进本期内容里辨识度很高。`,
  ]
  return templates[variantSeed]
}

function buildArtworkCommentsByPid(
  artworks: CurationArtworkSource[],
  input: Omit<ArtworkCommentInput, 'artwork' | 'artworks'>
) {
  const summary = collectTagSummary(artworks)
  const artworkCommentsByPid: Record<string, string> = {}

  for (const artwork of artworks) {
    artworkCommentsByPid[String(artwork.id)] = buildArtworkComment(artwork, summary, input)
  }

  return artworkCommentsByPid
}

function buildDailyTitle(pickDate: string, summary: TagSummary) {
  const prefix = formatDisplayDate(pickDate)
  const focus = joinReadableLabels(summary.topTags.map((item) => item.label), 3)

  if (!focus) {
    return `${prefix} 每日美图精选`
  }

  return `${prefix} 每日美图精选：${focus}`
}

function buildDailyDescription(artworks: CurationArtworkSource[], summary: TagSummary) {
  const pieces = [`本期从 ${artworks.length} 张已收藏作品中整理出一组适合连续浏览的插画精选`]

  const topTagsText = joinReadableLabels(summary.topTags.map((item) => item.label), 4)
  if (topTagsText) {
    pieces.push(`主要视觉线索集中在 ${topTagsText}`)
  }

  if (summary.characterTags.length > 0) {
    pieces.push(`角色元素更偏向 ${joinReadableLabels(summary.characterTags, 2)}`)
  }

  if (summary.sceneTags.length > 0) {
    pieces.push(`场景氛围常见于 ${joinReadableLabels(summary.sceneTags, 2)}`)
  }

  if (summary.artistCount > 0) {
    pieces.push(`当前共覆盖 ${summary.artistCount} 位画师的作品`)
  }

  return `${pieces.join('，')}。`
}

function extractTopicKeywords(topicName: string) {
  return Array.from(
    new Set(
      topicName
        .split(/[、,，/|]/)
        .map((item) => sanitizeText(item))
        .filter(Boolean)
    )
  )
}

function buildTopicDescription(
  topicName: string,
  artworks: CurationArtworkSource[],
  summary: TagSummary
) {
  const topTagsText = joinReadableLabels(summary.topTags.map((item) => item.label), 4)
  if (!topTagsText) {
    return `围绕 ${topicName} 整理的专题，当前收录 ${artworks.length} 张作品，适合快速浏览这一方向下不同画师的处理方式。`
  }

  return `围绕 ${topicName} 整理的专题，当前收录 ${artworks.length} 张作品，标签主要集中在 ${topTagsText}，适合快速浏览这一方向下不同画师的画面处理与情绪表达。`
}

function buildTopicFeatureContent(
  topicName: string,
  artworks: CurationArtworkSource[],
  summary: TagSummary
) {
  const topTags = summary.topTags.map((item) => item.label)
  const topTagText = topTags.length > 0
    ? topTags.slice(0, 5).map((tag) => `\`${tag}\``).join('、')
    : '`角色表现`、`画面完成度`'
  const characterText = summary.characterTags.length > 0
    ? joinReadableLabels(summary.characterTags, 3)
    : '角色主体与造型细节'
  const sceneText = summary.sceneTags.length > 0
    ? joinReadableLabels(summary.sceneTags, 3)
    : '背景氛围和画面空间关系'
  const styleText = summary.styleTags.length > 0
    ? joinReadableLabels(summary.styleTags, 3)
    : '色彩层次与视觉节奏'
  const expansionText = topTags.length > 0 ? joinReadableLabels(topTags, 3) : topicName

  return [
    '## 专题概览',
    '',
    `本期围绕 **${topicName}** 整理了 ${artworks.length} 张已收藏作品，优先挑选出在主题辨识度、画面完成度和浏览连贯性上表现稳定的素材，方便直接进入人工微审核和发布环节。`,
    '',
    '## 标签词云',
    '',
    `当前高频标签主要集中在 ${topTagText}。如果继续拆分，角色元素更偏向 ${characterText}，场景信息更常见于 ${sceneText}，风格表达则集中在 ${styleText}。`,
    '',
    '## 选图方向',
    '',
    `- 优先保留能直接体现「${topicName}」主题的画面`,
    `- 同时观察不同画师在 ${characterText} 上的处理差异`,
    `- 补充 ${sceneText} 方向的作品，可以让整组内容更完整`,
    '',
    '## 发布建议',
    '',
    `如果后续继续扩充专题，建议优先补充 ${expansionText} 这些方向的素材，并维持封面图与正文图在视觉节奏上的层次差异。`,
  ].join('\n')
}

function buildDefaultTopicTags(topicName: string, summary: TagSummary) {
  const keywords = extractTopicKeywords(topicName)
  const values = [...keywords, ...summary.topTags.map((item) => item.label).slice(0, 6)]

  return Array.from(new Set(values)).join(',')
}

function buildArtistFeatureTitle(artistName: string, summary: TagSummary) {
  const focus = joinReadableLabels(summary.topTags.map((item) => item.label), 2)
  if (!focus) {
    return `${artistName} 插画精选`
  }

  return `${artistName} 插画精选：${focus}`
}

function buildArtistFeatureContent(
  artistName: string,
  artworks: CurationArtworkSource[],
  summary: TagSummary
) {
  const topTags = summary.topTags.map((item) => item.label)
  const topTagText = topTags.length > 0
    ? topTags.slice(0, 5).map((tag) => `\`${tag}\``).join('、')
    : '`角色塑造`、`画面氛围`'
  const characterText = summary.characterTags.length > 0
    ? joinReadableLabels(summary.characterTags, 3)
    : '角色主体与人物造型'
  const sceneText = summary.sceneTags.length > 0
    ? joinReadableLabels(summary.sceneTags, 3)
    : '场景空间与背景氛围'
  const styleText = summary.styleTags.length > 0
    ? joinReadableLabels(summary.styleTags, 3)
    : '色彩控制、光影层次与画面节奏'
  const artistCountText = summary.artistCount > 1
    ? `当前样本里也混入了 ${summary.artistCount} 位画师，但整体仍以 ${artistName} 的风格线索为主。`
    : `当前样本全部来自 ${artistName} 的作品，更适合用来观察其个人风格。`

  return [
    '## 画师概览',
    '',
    `本期围绕 **${artistName}** 整理了 ${artworks.length} 张作品，优先保留在完成度、辨识度和连贯浏览体验上更稳定的素材，方便后续直接进入审核与发布。`,
    '',
    '## 高频视觉元素',
    '',
    `从当前作品里看，高频标签主要集中在 ${topTagText}。角色侧的关键词更偏向 ${characterText}，场景信息更常见于 ${sceneText}，而风格表达则集中在 ${styleText}。`,
    '',
    '## 选图观察',
    '',
    `- 适合优先保留能直接体现 ${artistName} 个人辨识度的作品`,
    `- 如果想让专题更完整，可以同时覆盖 ${characterText} 与 ${sceneText} 两类画面`,
    `- 正文排版上建议穿插不同景别，避免整组图片节奏过于单一`,
    '',
    '## 使用建议',
    '',
    `${artistCountText} 如果后续继续扩充这个专题，建议优先补充 ${joinReadableLabels(topTags, 3) || '代表性角色与场景'} 这些方向的作品。`,
  ].join('\n')
}

export function generateArtworkComment({
  artwork,
  artworks,
  mode,
  topicName,
  artistName,
}: ArtworkCommentInput) {
  const sourceArtworks = artworks && artworks.length > 0 ? artworks : [artwork]
  const summary = collectTagSummary(sourceArtworks)
  return buildArtworkComment(artwork, summary, { mode, topicName, artistName })
}

export function generateDailyPickContent({
  pickDate,
  artworks,
}: DailyContentInput): GeneratedDailyPickContent {
  const summary = collectTagSummary(artworks)

  return {
    title: buildDailyTitle(pickDate, summary),
    description: buildDailyDescription(artworks, summary),
    artworkCommentsByPid: buildArtworkCommentsByPid(artworks, { mode: 'daily' }),
  }
}

export function generateTopicFeatureContent({
  topicName,
  artworks,
}: TopicContentInput): GeneratedTopicFeatureContent {
  const summary = collectTagSummary(artworks)

  return {
    topicDescription: buildTopicDescription(topicName, artworks, summary),
    featureContent: buildTopicFeatureContent(topicName, artworks, summary),
    tags: buildDefaultTopicTags(topicName, summary),
    artworkCommentsByPid: buildArtworkCommentsByPid(artworks, { mode: 'topic', topicName }),
  }
}

export function generateArtistFeatureContent({
  artistName,
  artworks,
}: ArtistContentInput): GeneratedArtistFeatureContent {
  const summary = collectTagSummary(artworks)

  return {
    featureTitle: buildArtistFeatureTitle(artistName, summary),
    featureContent: buildArtistFeatureContent(artistName, artworks, summary),
    artworkCommentsByPid: buildArtworkCommentsByPid(artworks, { mode: 'artist', artistName }),
  }
}
