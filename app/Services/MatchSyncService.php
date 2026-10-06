<?php

namespace App\Services;

use App\Models\League;
use App\Models\FootballMatch;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MatchSyncService
{
    protected MisliApiService $misliApiService;

    public function __construct(MisliApiService $misliApiService)
    {
        $this->misliApiService = $misliApiService;
    }

    /**
     * Synchronize all daily matches (including upcoming / başlamamış) from Misli.com into Database
     */
    public function syncLiveMatches(?string $date = null): array
    {
        $rawMatches = $this->misliApiService->fetchAllDailyMatches($date);
        if (empty($rawMatches)) {
            return [];
        }

        $processed = $this->misliApiService->processMatchesConcurrently($rawMatches);
        if (empty($processed)) {
            return [];
        }

        $leaguesToUpsert = [];
        $matchesToUpsert = [];
        $activeMatchIds = [];

        foreach ($processed as $item) {
            $leagueData = $item['league'];
            $matchData = $item['match'];

            $leaguesToUpsert[$leagueData['league_id']] = [
                'league_id' => $leagueData['league_id'],
                'league_name' => $leagueData['league_name'],
                'league_country' => $leagueData['league_country'],
                'league_flag' => $leagueData['league_flag'],
                'updated_at' => now()->toDateTimeString(),
            ];

            $activeMatchIds[] = $matchData['match_id'];

            $matchesToUpsert[] = [
                'match_id' => $matchData['match_id'],
                'match_sgId' => $matchData['match_sgId'],
                'league_id' => $matchData['league_id'],
                'match_home_team_name' => $matchData['match_home_team_name'],
                'match_away_team_name' => $matchData['match_away_team_name'],
                'match_home_logo' => $matchData['match_home_logo'],
                'match_away_logo' => $matchData['match_away_logo'],
                'match_half_time_score' => $matchData['match_half_time_score'],
                'match_current_score' => $matchData['match_current_score'],
                'match_pen_score' => $matchData['match_pen_score'],
                'match_startTime' => $matchData['match_startTime'],
                'match_minute' => $matchData['match_minute'],
                'match_status' => $matchData['match_status'],
                'match_abbr' => $matchData['match_abbr'],
                'match_broadcaster' => $matchData['match_broadcaster'],
                'match_red_cards' => json_encode($matchData['match_red_cards']),
                'match_rates' => json_encode($matchData['match_rates']),
                'match_vendorType' => $matchData['match_vendorType'],
                'updated_at' => now()->toDateTimeString(),
            ];
        }

        DB::transaction(function () use ($leaguesToUpsert, $matchesToUpsert) {
            // Upsert Leagues
            foreach ($leaguesToUpsert as $l) {
                League::updateOrCreate(
                    ['league_id' => $l['league_id']],
                    [
                        'league_name' => $l['league_name'],
                        'league_country' => $l['league_country'],
                        'league_flag' => $l['league_flag'],
                    ]
                );
            }

            // Upsert Matches (Atomic)
            foreach ($matchesToUpsert as $m) {
                FootballMatch::updateOrCreate(
                    ['match_id' => $m['match_id']],
                    [
                        'match_sgId' => $m['match_sgId'],
                        'league_id' => $m['league_id'],
                        'match_home_team_name' => $m['match_home_team_name'],
                        'match_away_team_name' => $m['match_away_team_name'],
                        'match_home_logo' => $m['match_home_logo'],
                        'match_away_logo' => $m['match_away_logo'],
                        'match_half_time_score' => $m['match_half_time_score'],
                        'match_current_score' => $m['match_current_score'],
                        'match_pen_score' => $m['match_pen_score'],
                        'match_startTime' => $m['match_startTime'],
                        'match_minute' => $m['match_minute'],
                        'match_status' => $m['match_status'],
                        'match_abbr' => $m['match_abbr'],
                        'match_broadcaster' => $m['match_broadcaster'],
                        'match_red_cards' => is_string($m['match_red_cards']) ? json_decode($m['match_red_cards'], true) : $m['match_red_cards'],
                        'match_rates' => is_string($m['match_rates']) ? json_decode($m['match_rates'], true) : $m['match_rates'],
                        'match_vendorType' => $m['match_vendorType'],
                    ]
                );
            }
        });

        return $matchesToUpsert;
    }
}
