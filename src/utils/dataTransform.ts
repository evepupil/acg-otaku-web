/**
 * 数据转换工具函数
 * 用于在不同数据格式之间进行转换
 */

import { Artwork as MockArtwork } from '../data/mockData';
import { Artwork as TypeArtwork } from '../types';

/**
 * 将mockData中的Artwork格式转换为types中定义的Artwork格式
 * @param mockArtwork mockData中的作品数据
 * @returns 转换后的作品数据
 */
export const transformMockArtworkToType = (mockArtwork: MockArtwork): TypeArtwork => {
  return {
    id: parseInt(mockArtwork.id),
    title: mockArtwork.title,
    artist: {
      id: parseInt(mockArtwork.artist_id.replace('artist_', '')),
      name: mockArtwork.artist_name,
      avatar: `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(mockArtwork.artist_name + ' avatar')}&image_size=square`,
      followerCount: Math.floor(Math.random() * 50000) + 1000
    },
    imageUrl: mockArtwork.image_url,
    thumbnailUrl: mockArtwork.thumbnail_url,
    description: mockArtwork.description,
    tags: mockArtwork.tags,
    createdAt: mockArtwork.created_at,
    rank: mockArtwork.rank,
    stats: {
      views: mockArtwork.view_count,
      likes: mockArtwork.like_count,
      bookmarks: Math.floor(mockArtwork.like_count * 0.3)
    }
  };
};

/**
 * 批量转换作品数据
 * @param mockArtworks mockData中的作品数据数组
 * @returns 转换后的作品数据数组
 */
export const transformMockArtworksToType = (mockArtworks: MockArtwork[]): TypeArtwork[] => {
  return mockArtworks.map(transformMockArtworkToType);
};