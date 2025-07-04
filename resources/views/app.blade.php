<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <meta name="description"
    content="LawanJudol.ID adalah platform untuk menganalisis dan membersihkan komentar judi online dari video YouTube Anda secara otomatis.">

  <title inertia>{{ config('app.name', 'LawanJudol.ID') }}</title>

  <link rel="icon" href="/assets/images/logo.svg" type="image/svg">
  <link rel="preconnect" href="https://fonts.bunny.net">
  <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

  @routes
  @viteReactRefresh
  @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
  @inertiaHead
</head>

<body class="font-sans antialiased ">
  @inertia
</body>

</html>
