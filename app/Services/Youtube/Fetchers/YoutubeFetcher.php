<?php

namespace App\Services\Youtube\Fetchers;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\Response;

class YoutubeFetcher
{
  protected string $baseUrl;

  public function __construct()
  {
    $this->baseUrl = config('youtube.api.base_url');
  }

  public function fetchVideoById(string $googleToken, string $videoId): Response
  {
    return Http::withHeaders([
      'Authorization' => 'Bearer ' . $googleToken,
    ])->timeout(60)->get($this->baseUrl . '/videos', [
      'part' => 'snippet',
      'id' => $videoId,
    ]);
  }

  public function fetchAuthenticatedChannel(string $googleToken): Response
  {
    return Http::withHeaders([
      'Authorization' => 'Bearer ' . $googleToken,
    ])->timeout(60)->get($this->baseUrl . '/channels', [
      'part' => 'id,contentDetails',
      'mine' => 'true'
    ]);
  }

  public function fetchVideosFromPlaylist(string $googleToken, string $uploadsPlaylistId, ?string $nextPageToken = null): Response
  {
    $params = [
      'part' => 'snippet',
      'playlistId' => $uploadsPlaylistId,
      'maxResults' => config('youtube.api.videos_max_results_per_request'),
    ];

    if ($nextPageToken) {
      $params['pageToken'] = $nextPageToken;
    }

    return Http::withHeaders([
      'Authorization' => 'Bearer ' . $googleToken,
    ])->timeout(60)->get($this->baseUrl . '/playlistItems', $params);
  }

  public function fetchComments(string $googleToken, string $videoId, ?string $nextPageToken = null): Response
  {
    $params = [
      'part' => 'snippet',
      'videoId' => $videoId,
      'maxResults' =>  config('youtube.api.comments_max_results_per_request'),
    ];

    if ($nextPageToken) {
      $params['pageToken'] = $nextPageToken;
    }

    return Http::withHeaders([
      'Authorization' => 'Bearer ' . $googleToken,
    ])->timeout(60)->get($this->baseUrl . '/commentThreads', $params);
  }

  public function fetchModerationComment(string $googleToken, string $commentId, string $moderationStatus, bool $banAuthor = false): Response
  {
    if ($moderationStatus === 'reject') {
      $moderationStatus = 'rejected';
    }

    $params = [
      'id' => $commentId,
      'moderationStatus' => $moderationStatus,
    ];

    if ($moderationStatus === 'rejected' && $banAuthor !== null) {
      $params['banAuthor'] = $banAuthor ? 'true' : 'false';
    }

    return Http::withHeaders([
      'Authorization' => 'Bearer ' . $googleToken,
    ])->timeout(60)->asForm()->post($this->baseUrl . '/comments/setModerationStatus', $params);
  }
}
