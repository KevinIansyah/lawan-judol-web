<?php

namespace App\Events;

use App\Models\Analysis;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AnalysisStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Analysis $analysis) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('App.Models.User.' . $this->analysis->user_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'analysis' => [
                'id' => $this->analysis->id,
                'status' => $this->analysis->status,
                'video' => $this->analysis->video,
                'created_at' => $this->analysis->created_at,
                'updated_at' => $this->analysis->updated_at,
                'type' => $this->analysis->type,
            ],
        ];
    }
}
