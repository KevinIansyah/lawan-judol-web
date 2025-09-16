<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <meta name="description"
    content="LawanJudol adalah platform untuk menganalisis dan membersihkan komentar judi online dari video YouTube Anda secara otomatis.">

  <!-- SEO & Social Meta -->
  <meta property="og:title" content="{{ config('app.name', 'LawanJudol') }}">
  <meta property="og:description"
    content="Platform untuk menganalisis dan membersihkan komentar judi online dari video YouTube Anda secara otomatis.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="{{ url()->current() }}">
  <meta property="og:image" content="{{ asset('/assets/images/logo.svg') }}">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{{ config('app.name', 'LawanJudol') }}">
  <meta name="twitter:description"
    content="Platform untuk menganalisis dan membersihkan komentar judi online dari video YouTube Anda secara otomatis.">

  <title inertia>{{ config('app.name', 'LawanJudol') }}</title>

  <!-- Favicon optimized -->
  <link rel="icon" href="/assets/images/logo.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/images/logo.svg">

  @routes
  @viteReactRefresh
  @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
  @inertiaHead

  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "{{ config('app.name', 'LawanJudol') }}",
    "description": "Platform untuk menganalisis dan membersihkan komentar judi online dari video YouTube Anda secara otomatis.",
    "url": "{{ url('/') }}",
    "applicationCategory": "WebApplication",
    "operatingSystem": "Web Browser"
  }
  </script>
</head>

<body class="font-sans antialiased">

  @inertia

</body>

</html>
