<?php

namespace App\Services\YouTube\Formatters;

class YoutubeFormatter
{
  public static function formatVideoById(array $video): array
  {
    $snippet = $video['snippet'] ?? [];
    $videoId = $video['id'];

    return [
      'video_id' => $videoId,
      'title' => $snippet['title'] ?? '',
      'description' => $snippet['description'] ?? '',
      'thumbnail' => $snippet['thumbnails']['medium']['url'] ?? $snippet['thumbnails']['default']['url'] ?? '',
      'published_at' => $snippet['publishedAt'] ?? '',
      'channel_title' => $snippet['channelTitle'] ?? '',
      'youtube_url' => 'https://www.youtube.com/watch?v=' . $videoId
    ];
  }

  public static function formatVideoByPlaylist(array $video): array
  {
    $snippet = $video['snippet'] ?? [];
    $videoId = $snippet['resourceId']['videoId'];

    return [
      'video_id' => $videoId,
      'title' => $snippet['title'] ?? '',
      'description' => $snippet['description'] ?? '',
      'thumbnail' => $snippet['thumbnails']['medium']['url'] ?? $snippet['thumbnails']['default']['url'] ?? '',
      'published_at' => $snippet['publishedAt'] ?? '',
      'channel_title' => $snippet['channelTitle'] ?? '',
      'youtube_url' => 'https://www.youtube.com/watch?v=' . $videoId,
    ];
  }

  public static function formatChannelDetails(array $channel): array
  {
    $snippet = $channel['snippet'] ?? [];
    $statistics = $channel['statistics'] ?? [];

    return [
      'title' => $snippet['title'] ?? '',
      'description' => $snippet['description'] ?? '',
      'subscriber_count' => $statistics['subscriberCount'] ?? 0,
      'video_count' => $statistics['videoCount'] ?? 0,
      'view_count' => $statistics['viewCount'] ?? 0
    ];
  }

  public static function formatTopLevelComment(array $comment, string $videoId): array
  {
    $topLevelComment = $comment['snippet']['topLevelComment'] ?? [];
    $snippet = $topLevelComment['snippet'] ?? [];

    return [
      'comment_id' => $topLevelComment['id'] ?? '',
      'text' => $snippet['textDisplay'] ?? '',
      'label' => 0,
      'source' => "Video: {$videoId}",
      'timestamp' => $snippet['publishedAt'] ?? '',
      'user_metadata' => [
        'username' => $snippet['authorDisplayName'] ?? '',
        'user_id' => $snippet['authorChannelId']['value'] ?? '',
        'profile_url' => $snippet['authorProfileImageUrl'] ?? '',
      ],
      'status' => 'draft',
    ];
  }
}
