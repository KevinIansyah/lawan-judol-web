<?php

return [
  'api' => [
    'base_url' => 'https://www.googleapis.com/youtube/v3',
    'max_requests' => 20,
    'max_results_per_request' => 50,
    'comments_max_results' => 100,
    'request_delay_microseconds' => 100000,
  ],
  'cache' => [
    'hours' => 24,
  ],
];
