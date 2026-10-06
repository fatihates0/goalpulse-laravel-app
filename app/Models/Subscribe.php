<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscribe extends Model
{
    use HasFactory;

    protected $table = 'subscribes';

    protected $fillable = [
        'endpoint',
        'expirationTime',
        'keys',
        'topic',
    ];

    protected $casts = [
        'keys' => 'array',
    ];
}
