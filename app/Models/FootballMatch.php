<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FootballMatch extends Model
{
    use HasFactory;

    protected $table = 'matches';

    protected $fillable = [
        'match_id',
        'match_sgId',
        'league_id',
        'match_home_team_name',
        'match_away_team_name',
        'match_home_logo',
        'match_away_logo',
        'match_half_time_score',
        'match_current_score',
        'match_pen_score',
        'match_startTime',
        'match_minute',
        'match_status',
        'match_abbr',
        'match_broadcaster',
        'match_red_cards',
        'match_rates',
        'match_vendorType',
    ];

    protected $casts = [
        'match_red_cards' => 'array',
        'match_rates' => 'array',
        'match_startTime' => 'datetime',
    ];

    public function league(): BelongsTo
    {
        return $this->belongsTo(League::class, 'league_id', 'league_id');
    }

    public function determineState(): array
    {
        $status = strtoupper(trim($this->match_status ?? ''));
        $abbr = strtoupper(trim($this->match_abbr ?? ''));

        $finishedStatuses = ['FINISHED', 'ENDED', 'FT', 'FULL_TIME', 'FULLTIME', 'COMPLETED', '100', 'MS', 'BITTI', 'UZMS', 'PS', 'AFTER_EXTRA_TIME', 'AET', 'AFTER_PENALTIES', 'AP'];
        $finishedAbbrs = ['MS', 'BITTI', 'UZMS', 'PS', 'FT', 'AET', 'AP'];

        $isFinished = in_array($status, $finishedStatuses) || in_array($abbr, $finishedAbbrs);
        $postponed = in_array($status, ['POSTPONED', 'SUSPENDED', 'DELAYED', 'ERT']) || $abbr === 'ERT';
        $cancelled = in_array($status, ['CANCELLED', 'CANCELED', 'ABANDONED', 'CANC', 'IPT']) || in_array($abbr, ['IPT', 'İPT']);

        if ($isFinished) {
            $badgeText = ($abbr === 'UZMS' || $status === 'AFTER_EXTRA_TIME') ? 'UZ MS' : (($abbr === 'PS' || $status === 'AFTER_PENALTIES') ? 'PEN' : 'MS');
            return ['is_live' => false, 'is_finished' => true, 'is_postponed' => $postponed, 'is_cancelled' => $cancelled, 'badge_text' => $badgeText];
        }

        if ($postponed) {
            return ['is_live' => false, 'is_finished' => false, 'is_postponed' => true, 'is_cancelled' => false, 'badge_text' => 'ERT'];
        }

        if ($cancelled) {
            return ['is_live' => false, 'is_finished' => false, 'is_postponed' => false, 'is_cancelled' => true, 'badge_text' => 'İPT'];
        }

        $liveStatuses = ['LIVE', 'IN_PROGRESS', 'INPROGRESS', 'PLAYING', '1ST_HALF', 'FIRST_HALF', '2ND_HALF', 'SECOND_HALF', 'HALF_TIME', 'HALFTIME', 'HT', 'BREAK', 'INT'];
        $liveAbbrs = ['1.Y', '2.Y', 'İY', 'IY', 'UZ 1.Y', 'UZ 2.Y', 'ARA'];

        $isLive = in_array($status, $liveStatuses) || in_array($abbr, $liveAbbrs);

        if (!$isLive && !empty($this->match_minute) && $this->match_minute !== '0' && (int)$this->match_minute < 90) {
            $isLive = true;
        }

        $badgeText = $this->match_minute ? "{$this->match_minute}'" : ($this->match_abbr ?: 'Canlı');

        return ['is_live' => $isLive, 'is_finished' => false, 'is_postponed' => false, 'is_cancelled' => false, 'badge_text' => $badgeText];
    }
}
