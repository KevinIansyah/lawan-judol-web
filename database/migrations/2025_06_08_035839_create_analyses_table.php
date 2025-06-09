<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('analyses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained()
                ->onDelete('cascade')
                ->comment('ID of the user who initiated the analysis');
            $table->json('video')
                ->comment('Serialized video data (e.g. YouTube video metadata)');
            $table->enum('status', ['queue', 'on_process', 'failed', 'success'])
                ->comment('Current status of the analysis');
            $table->enum('type', ['public', 'your'])
                ->comment('Video type: public = from other users\' channels, your = from the authenticated user\'s own channel');
            $table->string('gambling_file_path')->nullable()->comment('Path to gambling keyword match result file');
            $table->string('nongambling_file_path')->nullable()->comment('Path to clean result file (non-gambling)');
            $table->string('keyword_file_path')->nullable()->comment('Path to original keyword input file');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analyses');
    }
};
