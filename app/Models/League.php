<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class League extends Model
{
    use HasFactory;

    protected $fillable = [
        'league_id',
        'league_name',
        'league_country',
        'league_flag',
    ];

    public function matches(): HasMany
    {
        return $this->hasMany(FootballMatch::class, 'league_id', 'league_id');
    }
}
