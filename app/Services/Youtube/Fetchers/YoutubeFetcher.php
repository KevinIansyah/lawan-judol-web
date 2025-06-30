<?php

namespace App\Services\YouTube\Fetchers;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\Response;

class YoutubeFetcher
{
  protected string $baseUrl;

  public function __construct()
  {
    $this->baseUrl = config('youtube.api.base_url');
  }

  /**
   * Mengambil data video berdasarkan video ID
   */
  public function videoDetailsById(string $googleToken, string $videoId): Response
  {
    return Http::withHeaders([
      'Authorization' => 'Bearer ' . $googleToken,
    ])->timeout(30)->get($this->baseUrl . '/videos', [
      'part' => 'id,snippet,contentDetails,statistics',
      'id' => $videoId,
    ]);
  }

  /**
   * Mengambil channel milik pengguna (authenticated user)
   */
  public function authenticatedUserChannel(string $googleToken): Response
  {
    return Http::withHeaders([
      'Authorization' => 'Bearer ' . $googleToken,
    ])->timeout(30)->get($this->baseUrl . '/channels', [
      'part' => 'id,snippet,contentDetails,statistics',
      'mine' => 'true'
    ]);
  }

  /**
   * Mengambil daftar video dari playlist upload milik pengguna
   */
  public function videosFromUploadsPlaylist(string $googleToken, string $uploadsPlaylistId, ?string $nextPageToken = null): Response
  {
    $params = [
      'part' => 'snippet,contentDetails',
      'playlistId' => $uploadsPlaylistId,
      'maxResults' => config('youtube.api.max_results_per_request'),
    ];

    if ($nextPageToken) {
      $params['pageToken'] = $nextPageToken;
    }

    return Http::withHeaders([
      'Authorization' => 'Bearer ' . $googleToken,
    ])->timeout(30)->get($this->baseUrl . '/playlistItems', $params);
  }

  /**
   * Mengambil komentar dari video tertentu
   */
  public function videoComments(string $googleToken, string $videoId, ?string $nextPageToken = null): Response
  {
    $params = [
      'part' => 'snippet',
      'videoId' => $videoId,
      'maxResults' =>  config('youtube.api.comments_max_results'),
    ];

    if ($nextPageToken) {
      $params['pageToken'] = $nextPageToken;
    }

    return Http::withHeaders([
      'Authorization' => 'Bearer ' . $googleToken,
    ])->timeout(30)->get($this->baseUrl . '/commentThreads', $params);
  }
}
