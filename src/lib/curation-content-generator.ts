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
  priority: number
}

interface TagSummary {
  topTags: TagInsight[]
  topSpecificTags: TagInsight[]
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

interface NormalizedTag {
  key: string
  label: string
  priority: number
  isGeneric: boolean
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
  '創作',
  '原创',
  '插画',
  '二次元',
  'anime',
  'art',
  'fanart',
  'かわいい',
  '可爱',
  '好看',
  '太美了',
  '綺麗',
])

const GENERIC_TAG_LABELS = new Set([
  '少女',
  '女孩子',
  '美少女',
  '长发女孩',
  '角色',
  '原创',
  '插画',
  '头像',
  '壁纸',
])

const WEAK_TAG_LABELS = new Set([
  '少女',
  '女孩子',
  '美少女',
  '角色',
  '原创',
  '插画',
])

const STOP_TAG_PATTERNS = [
  /^\d+(users入り|user入り)$/i,
  /^\d+(收藏|收藏数|点赞|喜欢)$/i,
  /users入り/i,
  /收藏\d*/i,
  /\d+收藏/i,
  /ブックマーク/i,
  /bookmark/i,
  /ranking/i,
  /ランキング/i,
  /dailyranking/i,
  /weeklyranking/i,
  /monthlyranking/i,
]

const TAG_ALIAS_GROUPS: Array<{ label: string; aliases: string[]; priority?: number }> = [
  { label: '少女', aliases: ['女の子', 'girl', 'girls', '女孩', '女生', '少女', '女孩子'], priority: 0 },
  { label: '美少女', aliases: ['bishoujo', 'beautiful girl', '美少女'], priority: 0 },
  { label: '长发', aliases: ['ロングヘア', 'longhair', 'long hair', '長髪', '长发'], priority: 2 },
  { label: '短发', aliases: ['ショートヘア', 'shorthair', 'short hair', '短髪', '短发'], priority: 2 },
  { label: '白发', aliases: ['白髪', 'whitehair', 'white hair', '白发'], priority: 2 },
  { label: '黑发', aliases: ['黒髪', 'blackhair', 'black hair', '黑发'], priority: 2 },
  { label: '金发', aliases: ['金髪', 'blonde', 'blondehair', 'blonde hair', '金发'], priority: 2 },
  { label: '双马尾', aliases: ['ツインテール', 'twintails', 'twin tails', '双马尾'], priority: 3 },
  { label: '兽耳', aliases: ['ケモ耳', '獣耳', 'animalears', 'animal ears', '兽耳'], priority: 3 },
  { label: '制服', aliases: ['schooluniform', 'school uniform', '制服'], priority: 4 },
  { label: '和服', aliases: ['着物', 'kimono', '和服'], priority: 4 },
  { label: '旗袍', aliases: ['チャイナドレス', 'qipao', 'cheongsam', '旗袍'], priority: 5 },
  { label: '泳装', aliases: ['水着', 'swimsuit', '泳装'], priority: 4 },
  { label: '眼镜', aliases: ['megane', 'glasses', '眼鏡', '眼镜'], priority: 3 },
  { label: '天空', aliases: ['sky', '青空', '空', '天空'], priority: 3 },
  { label: '海边', aliases: ['sea', 'beach', 'ocean', '海', '海辺', '海边'], priority: 4 },
  { label: '夜景', aliases: ['night', 'nightview', 'night view', '夜景', '夜空'], priority: 4 },
  { label: '樱花', aliases: ['桜', 'sakura', 'cherryblossom', 'cherry blossom', '樱花'], priority: 4 },
  { label: '雨景', aliases: ['rain', '雨', '雨景'], priority: 4 },
  { label: '雪景', aliases: ['雪', 'snow', 'snowing', '雪景'], priority: 5 },
  { label: '光影', aliases: ['lighting', 'light', '光', '光影'], priority: 4 },
  { label: '氛围感', aliases: ['mood', 'atmosphere', '雰囲気', '氛围感'], priority: 4 },
  { label: '壁纸感', aliases: ['wallpaper', '壁紙', '壁纸'], priority: 1 },
  { label: '头像感', aliases: ['icon', 'profile', 'avatar', '头像'], priority: 1 },
]

const CHARACTER_KEYWORDS = [
  '少女',
  '美少女',
  '长发',
  '短发',
  '白发',
  '黑发',
  '金发',
  '双马尾',
  '兽耳',
  '制服',
  '和服',
  '旗袍',
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
  '雪景',
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
  '壁纸感',
  '头像感',
  '厚涂',
  '水彩',
  '赛璐璐',
  '电影感',
  '高对比',
  '低饱和',
  '色彩',
]

const TAG_ALIAS_MAP = new Map<
  string,
  { label: string; priority: number; isGeneric: boolean }
>(
  TAG_ALIAS_GROUPS.flatMap((group) =>
    group.aliases.map((alias) => [
      normalizeTagKey(alias),
      {
        label: group.label,
        priority: group.priority ?? 1,
        isGeneric: GENERIC_TAG_LABELS.has(group.label),
      },
    ] as const)
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

function hasTooManyDigits(value: string) {
  const digitMatches = value.match(/\d/g) ?? []
  return digitMatches.length >= 4
}

function shouldDiscardTag(display: string, key: string) {
  if (STOP_TAG_EXACT.has(key)) {
    return true
  }

  if (STOP_TAG_PATTERNS.some((pattern) => pattern.test(display) || pattern.test(key))) {
    return true
  }

  if (hasTooManyDigits(display) && /(收藏|users入り|bookmark|ranking|排行|热度)/i.test(display)) {
    return true
  }

  if (display.length > 24) {
    return true
  }

  return false
}

function getTagPriority(label: string, fallback = 1) {
  if (WEAK_TAG_LABELS.has(label)) {
    return 0
  }

  if (STYLE_KEYWORDS.some((keyword) => label.includes(keyword))) {
    return Math.max(fallback, 3)
  }

  if (SCENE_KEYWORDS.some((keyword) => label.includes(keyword))) {
    return Math.max(fallback, 4)
  }

  if (CHARACTER_KEYWORDS.some((keyword) => label.includes(keyword))) {
    return Math.max(fallback, 2)
  }

  return fallback
}

function normalizeTagLabel(tag: string): NormalizedTag | null {
  const display = sanitizeText(tag)
  if (!display) {
    return null
  }

  const key = normalizeTagKey(display)
  if (!key || shouldDiscardTag(display, key)) {
    return null
  }

  const alias = TAG_ALIAS_MAP.get(key)
  if (alias) {
    return {
      key: normalizeTagKey(alias.label),
      label: alias.label,
      priority: alias.priority,
      isGeneric: alias.isGeneric,
    }
  }

  if (display.length > 18) {
    return null
  }

  const isGeneric = GENERIC_TAG_LABELS.has(display)
  return {
    key,
    label: display,
    priority: getTagPriority(display),
    isGeneric,
  }
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
          priority: normalized.priority,
        })
      }
    }
  }

  const sorted = Array.from(counters.values()).sort((left, right) => {
    const rightScore = right.count * 10 + right.priority
    const leftScore = left.count * 10 + left.priority
    if (rightScore !== leftScore) {
      return rightScore - leftScore
    }
    return left.label.localeCompare(right.label, 'zh-Hans-CN')
  })

  const topSpecificTags = sorted.filter((item) => item.priority > 0)

  const pickCategoryTags = (keywords: string[]) =>
    sorted
      .filter((item) => item.priority > 0)
      .filter((item) => keywords.some((keyword) => item.label.includes(keyword)))
      .slice(0, 3)
      .map((item) => item.label)

  return {
    topTags: sorted.slice(0, 8),
    topSpecificTags: topSpecificTags.slice(0, 8),
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
  if (artwork.title && artwork.title.trim() && artwork.title.trim().length <= 18) {
    return artwork.title.trim()
  }

  return '画面氛围'
}

function getArtworkFocusTags(artwork: CurationArtworkSource, summary: TagSummary) {
  const normalized = artwork.tags
    .map((tag) => normalizeTagLabel(tag))
    .filter((item): item is NormalizedTag => Boolean(item))

  const seen = new Set<string>()
  const unique = normalized.filter((item) => {
    if (seen.has(item.key)) {
      return false
    }
    seen.add(item.key)
    return true
  })

  const topSpecificKeySet = new Set(summary.topSpecificTags.map((item) => item.key))
  const preferred = unique.filter((item) => topSpecificKeySet.has(item.key) && item.priority > 0)
  const specific = unique.filter((item) => item.priority > 0)
  const generic = unique.filter((item) => item.priority === 0)

  const labels = [
    ...preferred.map((item) => item.label),
    ...specific.map((item) => item.label),
    ...generic.map((item) => item.label),
  ]

  return Array.from(new Set(labels)).slice(0, 2).length > 0
    ? Array.from(new Set(labels)).slice(0, 2)
    : [getFallbackFocus(artwork)]
}

function buildNaturalFocusText(focusTags: string[]) {
  if (focusTags.length === 1) {
    return focusTags[0]
  }
  return `${focusTags[0]}和${focusTags[1]}`
}

function buildArtworkComment(
  artwork: CurationArtworkSource,
  summary: TagSummary,
  input: Omit<ArtworkCommentInput, 'artwork' | 'artworks'>
) {
  const focusTags = getArtworkFocusTags(artwork, summary)
  const focusText = buildNaturalFocusText(focusTags)
  const variantSeed = Number(String(artwork.id).slice(-2)) % 5

  if (input.mode === 'topic') {
    const topicName = input.topicName || '当前专题'
    const templates = [
      `这张最容易留下印象的地方，是 ${focusText} 这一块做得比较集中，放进「${topicName}」里会更容易把主题立住。`,
      `相比同组作品，这张在 ${focusText} 上更有辨识度，拿来放在「${topicName}」里做支点会比较合适。`,
      `这张的优势不在信息量，而在 ${focusText} 处理得很完整，放进专题里会显得更稳。`,
      `如果想让「${topicName}」不只是简单堆图，这张能提供比较明确的视觉重点，核心还是 ${focusText}。`,
      `这张比较适合留在专题里做定调图，${focusText} 一出来，整组内容的方向就会清楚很多。`,
    ]
    return templates[variantSeed]
  }

  if (input.mode === 'artist') {
    const artistName = input.artistName || artwork.artist?.name || '这位画师'
    const templates = [
      `这张里 ${focusText} 的处理很能说明 ${artistName} 的个人习惯，放进专题里会比较有代表性。`,
      `如果要看 ${artistName} 的风格线索，这张会是比较直观的一张，重点基本都落在 ${focusText} 上。`,
      `这张不算靠复杂设定取胜，但 ${focusText} 这部分做得很稳，能把 ${artistName} 的气质带出来。`,
      `和同组作品放在一起看，这张在 ${focusText} 上更成熟，适合留下来说明 ${artistName} 的常用表达。`,
      `这张最值得保留的原因，是 ${focusText} 处理得干净利落，很适合作为画师专题里的代表作之一。`,
    ]
    return templates[variantSeed]
  }

  const templates = [
    `这张更打动人的地方，是 ${focusText} 这一块处理得比较完整，放在这一期里会比较容易拉开层次。`,
    `和同组作品相比，它在 ${focusText} 上更有辨识度，第一眼就能把注意力抓住。`,
    `这张不靠复杂信息取胜，重点是 ${focusText} 呈现得很干净，放进这一期里会比较舒服。`,
    `画面里最出彩的还是 ${focusText} 的组合，既有记忆点，也不会破坏整组浏览节奏。`,
    `这张的完成度主要体现在 ${focusText} 上，情绪很稳，适合留在这一期里做氛围补充。`,
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

function getLeadingTags(summary: TagSummary, limit: number) {
  const source = summary.topSpecificTags.length > 0 ? summary.topSpecificTags : summary.topTags
  return source.map((item) => item.label).slice(0, limit)
}

function buildDailyTitle(pickDate: string, summary: TagSummary) {
  const prefix = formatDisplayDate(pickDate)
  const leadingTags = getLeadingTags(summary, 2)

  if (leadingTags.length === 0) {
    return `${prefix} 每日美图精选`
  }

  return `${prefix} 每日美图精选：${leadingTags.join('、')}`
}

function buildDailyDescription(artworks: CurationArtworkSource[], summary: TagSummary) {
  const parts = [`这一期挑出的 ${artworks.length} 张作品，整体看下来画面方向比较统一`]
  const leadingTags = getLeadingTags(summary, 3)

  if (leadingTags.length > 0) {
    parts.push(`更容易反复看到 ${joinReadableLabels(leadingTags)} 这些元素`)
  }

  if (summary.characterTags.length > 0) {
    parts.push(`角色侧主要集中在 ${joinReadableLabels(summary.characterTags, 2)}`)
  }

  if (summary.sceneTags.length > 0) {
    parts.push(`场景上则穿插了 ${joinReadableLabels(summary.sceneTags, 2)} 这样的变化`)
  }

  if (summary.styleTags.length > 0) {
    parts.push(`整体气质会更偏向 ${joinReadableLabels(summary.styleTags, 2)}`)
  }

  parts.push(`当前共覆盖 ${summary.artistCount} 位画师`)

  return `${parts.join('，')}。`
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
  const leadingTags = getLeadingTags(summary, 4)
  if (leadingTags.length === 0) {
    return `围绕 ${topicName} 整理出的专题，当前收录 ${artworks.length} 张作品，适合快速浏览这一方向下不同画师的处理方式。`
  }

  return `围绕 ${topicName} 整理出的专题，当前收录 ${artworks.length} 张作品，比较稳定出现的元素有 ${joinReadableLabels(leadingTags)}，整体浏览起来会更容易看出这一题材的共性。`
}

function buildTopicFeatureContent(
  topicName: string,
  artworks: CurationArtworkSource[],
  summary: TagSummary
) {
  const topTags = getLeadingTags(summary, 5)
  const topTagText = topTags.length > 0
    ? topTags.map((tag) => `\`${tag}\``).join('、')
    : '`角色表现`、`画面完成度`'
  const characterText = summary.characterTags.length > 0
    ? joinReadableLabels(summary.characterTags, 3)
    : '角色主体与造型细节'
  const sceneText = summary.sceneTags.length > 0
    ? joinReadableLabels(summary.sceneTags, 3)
    : '背景氛围和空间关系'
  const styleText = summary.styleTags.length > 0
    ? joinReadableLabels(summary.styleTags, 3)
    : '色彩层次与视觉节奏'
  const expansionText = topTags.length > 0 ? joinReadableLabels(topTags, 3) : topicName

  return [
    '## 专题概览',
    '',
    `这次围绕 **${topicName}** 整理了 ${artworks.length} 张作品，优先保留了主题明确、完成度稳定、连着看也不会打架的图，方便后续直接做人工微审核。`,
    '',
    '## 这组图在看什么',
    '',
    `目前最稳定出现的标签主要是 ${topTagText}。拆开来看，角色信息更偏向 ${characterText}，场景变化更多出现在 ${sceneText}，而整体风格则会落在 ${styleText} 这一类表达上。`,
    '',
    '## 选图建议',
    '',
    `- 优先保留能直接体现「${topicName}」主题的画面`,
    `- 尽量让 ${characterText} 和 ${sceneText} 两类图都被覆盖到`,
    `- 排版时可以让强主题图和氛围图交替出现，整篇会更耐看`,
    '',
    '## 后续扩充方向',
    '',
    `如果还要继续补图，建议优先沿着 ${expansionText} 这些方向扩充，专题会更完整。`,
  ].join('\n')
}

function buildDefaultTopicTags(topicName: string, summary: TagSummary) {
  const keywords = extractTopicKeywords(topicName)
  const values = [...keywords, ...getLeadingTags(summary, 6)]
  return Array.from(new Set(values)).join(',')
}

function buildArtistFeatureTitle(artistName: string, summary: TagSummary) {
  const leadingTags = getLeadingTags(summary, 2)
  if (leadingTags.length === 0) {
    return `${artistName} 插画精选`
  }

  return `${artistName} 插画精选：${leadingTags.join('、')}`
}

function buildArtistFeatureContent(
  artistName: string,
  artworks: CurationArtworkSource[],
  summary: TagSummary
) {
  const topTags = getLeadingTags(summary, 5)
  const topTagText = topTags.length > 0
    ? topTags.map((tag) => `\`${tag}\``).join('、')
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

  return [
    '## 画师概览',
    '',
    `这次围绕 **${artistName}** 整理了 ${artworks.length} 张作品，优先挑出完成度稳定、风格辨识度高、放在同一篇里也能保持节奏的图。`,
    '',
    '## 这一组的共同点',
    '',
    `从当前样本看，出现频率更高的元素主要是 ${topTagText}。角色侧更容易看到 ${characterText}，场景则集中在 ${sceneText}，风格上的共同点更多体现在 ${styleText}。`,
    '',
    '## 看图时可以留意的地方',
    '',
    `- 哪些作品最能体现 ${artistName} 的个人辨识度`,
    `- 同一位画师在 ${characterText} 上会不会反复使用固定处理方式`,
    `- 当画面转到 ${sceneText} 时，整体气质有没有明显变化`,
    '',
    '## 组稿建议',
    '',
    `如果后续继续扩充这个专题，优先补充 ${joinReadableLabels(topTags, 3) || '代表性角色与场景'} 这几个方向，会更容易把画师专题做得完整。`,
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
