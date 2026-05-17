<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Reminder extends Model
{
    use BelongsToTenant;

    protected $fillable = ['client_id', 'user_id', 'title', 'due_at', 'completed'];

    protected $casts = [
        'due_at' => 'datetime',
        'completed' => 'boolean',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
