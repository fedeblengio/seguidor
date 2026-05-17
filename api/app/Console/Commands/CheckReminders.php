<?php

namespace App\Console\Commands;

use App\Models\Notification;
use App\Models\Reminder;
use Illuminate\Console\Command;

class CheckReminders extends Command
{
    protected $signature = 'reminders:check';
    protected $description = 'Create notifications for due reminders';

    public function handle(): void
    {
        $due = Reminder::where('completed', false)
            ->where('due_at', '<=', now())
            ->get();

        $created = 0;
        foreach ($due as $reminder) {
            $exists = Notification::where('user_id', $reminder->user_id)
                ->where('link', "/clients/{$reminder->client_id}")
                ->where('title', "Recordatorio: {$reminder->title}")
                ->where('read', false)
                ->exists();

            if (!$exists) {
                Notification::create([
                    'user_id' => $reminder->user_id,
                    'tenant_id' => $reminder->tenant_id,
                    'title' => "Recordatorio: {$reminder->title}",
                    'link' => "/clients/{$reminder->client_id}",
                ]);
                $created++;
            }
        }

        $this->info("Created {$created} notifications.");
    }
}
