<?php

return [
  'api' => [
    'base_url' => 'https://www.googleapis.com/youtube/v3',
    'videos_max_requests' => 1,
    'videos_max_results_per_request' => 50,
    'comments_max_results_per_request' => 100,
    'request_delay_microseconds' => 100000,
  ],
  'cache' => [
    'hours' => 24,
  ],
];
