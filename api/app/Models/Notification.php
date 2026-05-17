<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use BelongsToTenant;

    protected $fillable = ['user_id', 'tenant_id', 'title', 'link', 'read'];
    protected $casts = ['read' => 'boolean'];
}
