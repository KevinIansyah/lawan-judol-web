<?php

namespace App\Http\Controllers;

use App\Models\Keyword;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KeywordImportController extends Controller
{
  public function index()
  {
    return Inertia::render('keyword-import');
  }

  public function store(Request $request)
  {
    $request->validate([
      'json_file' => 'required|file|mimes:json,txt|max:10240'
    ]);

    $file = $request->file('json_file');
    $content = file_get_contents($file->getPathname());
    $data = json_decode($content, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
      return back()->withErrors(['json_file' => 'Invalid JSON format']);
    }

    $inserted = 0;
    $errors = [];

    foreach ($data as $index => $item) {
      try {
        if (!isset($item['word']) || empty(trim($item['word']))) {
          $errors[] = "Item " . ($index + 1) . ": Missing 'word' field";
          continue;
        }

        Keyword::create([
          'keyword' => trim($item['word']),
          'label' => 1
        ]);

        $inserted++;
      } catch (\Exception $e) {
        $errors[] = "Item " . ($index + 1) . ": " . $e->getMessage();
      }
    }

    $result = [
      'success' => true,
      'message' => "Import completed! Inserted: $inserted, Errors: " . count($errors),
      'data' => [
        'total_items' => count($data),
        'inserted' => $inserted,
        'errors' => count($errors),
        'error_details' => array_slice($errors, 0, 10)
      ]
    ];

    return Inertia::render('keyword-import', compact('result'));
  }
}
