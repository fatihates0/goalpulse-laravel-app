<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Client\Pool;

class MisliApiService
{
    protected string $liveMatchesUrl = 'https://apivx.misli.com/api/web/v1/statistics/sport/SOCCER/matches/live';
    protected string $dailyMatchesUrl = 'https://apivx.misli.com/api/web/v1/statistics/sport/SOCCER/matches';
    protected string $detailBaseUrl = 'https://apivx.misli.com/api/web/v2/sportsbook/event';
    protected string $statBaseUrl = 'https://apivx.misli.com/api/web/v1/statistics/sportType/SOCCER/match';

    /**
     * Fetch raw live matches from Misli
     */
    public function fetchLiveMatches(): array
    {
        try {
            $response = Http::timeout(10)->get($this->liveMatchesUrl);
            if ($response->successful()) {
                return $response->json('data.data') ?? [];
            }
        } catch (\Throwable $e) {
            Log::error('MisliApiService fetchLiveMatches error: ' . $e->getMessage());
        }

        return [];
    }

    /**
     * Fetch all daily matches (including upcoming / başlamamış matches)
     */
    public function fetchAllDailyMatches(?string $date = null): array
    {
        $targetDate = $date ?? now()->format('Y-m-d');
        $url = "{$this->dailyMatchesUrl}?date={$targetDate}";

        try {
            $response = Http::timeout(10)->get($url);
            if ($response->successful()) {
                $matches = $response->json('data.data') ?? [];

                // Merge with live matches to ensure live minutes and scores are fresh
                $liveMatches = $this->fetchLiveMatches();
                if (!empty($liveMatches)) {
                    $liveMap = [];
                    foreach ($liveMatches as $lm) {
                        if (isset($lm['sgId'])) {
                            $liveMap[$lm['sgId']] = $lm;
                        }
                    }

                    foreach ($matches as &$m) {
                        $sgId = $m['sgId'] ?? null;
                        if ($sgId && isset($liveMap[$sgId])) {
                            $m = array_merge($m, $liveMap[$sgId]);
                        }
                    }
                    unset($m);
                }

                return !empty($matches) ? $matches : $liveMatches;
            }
        } catch (\Throwable $e) {
            Log::error('MisliApiService fetchAllDailyMatches error: ' . $e->getMessage());
        }

        return $this->fetchLiveMatches();
    }

    /**
     * Process matches in parallel batches to fetch details & logos efficiently
     */
    public function processMatchesConcurrently(array $rawMatches): array
    {
        if (empty($rawMatches)) {
            return [];
        }

        // We process in chunks of 25 to avoid overwhelming network pool
        $chunks = array_chunk($rawMatches, 25);
        $processedResults = [];

        foreach ($chunks as $chunk) {
            $poolKeys = [];

            $poolResponses = Http::pool(function (Pool $pool) use ($chunk, &$poolKeys) {
                $requests = [];
                foreach ($chunk as $match) {
                    $sgId = $match['sgId'] ?? null;
                    if (!$sgId) continue;

                    $logoKey = "logo_{$sgId}";
                    if (!Cache::has("misli_logo_{$sgId}")) {
                        $requests[] = $pool->as($logoKey)->timeout(5)->get("{$this->statBaseUrl}/{$sgId}");
                        $poolKeys[] = $logoKey;
                    }

                    $singleKey = "single_{$sgId}";
                    if (!Cache::has("misli_single_{$sgId}")) {
                        $requests[] = $pool->as($singleKey)->timeout(5)->get("{$this->detailBaseUrl}/{$sgId}/single");
                        $poolKeys[] = $singleKey;
                    }
                }
                return $requests;
            });

            // Process pool responses into Cache
            foreach ($chunk as $match) {
                $sgId = $match['sgId'] ?? null;
                if (!$sgId) continue;

                $logoKey = "logo_{$sgId}";
                if (isset($poolResponses[$logoKey]) && $poolResponses[$logoKey]->successful()) {
                    $data = $poolResponses[$logoKey]->json('data') ?? [];
                    $logoData = [
                        'home' => $data['htflag'] ?? '',
                        'away' => $data['atflag'] ?? '',
                    ];
                    Cache::put("misli_logo_{$sgId}", $logoData, now()->addHours(6));
                }

                $singleKey = "single_{$sgId}";
                if (isset($poolResponses[$singleKey]) && $poolResponses[$singleKey]->successful()) {
                    $singleData = $poolResponses[$singleKey]->json('data') ?? [];
                    Cache::put("misli_single_{$sgId}", $singleData, now()->addSeconds(30));
                }
            }

            // Build match payload for each
            foreach ($chunk as $match) {
                $formatted = $this->formatSingleMatch($match);
                if ($formatted) {
                    $processedResults[] = $formatted;
                }
            }
        }

        return $processedResults;
    }

    /**
     * Format raw Misli match data into clean structure
     */
    protected function formatSingleMatch(array $match): ?array
    {
        $sgId = $match['sgId'] ?? null;
        if (!$sgId || !isset($match['tournament']['id'])) {
            return null;
        }

        $logos = Cache::get("misli_logo_{$sgId}", ['home' => '', 'away' => '']);
        $singleDetail = Cache::get("misli_single_{$sgId}", []);

        $findRate = function ($name) use ($singleDetail) {
            $mList = $singleDetail['m'] ?? [];
            if (!is_array($mList)) return null;

            foreach ($mList as $item) {
                if (($item['n'] ?? '') === $name) {
                    return $item;
                }
            }
            return null;
        };

        $iyOranlar = $findRate("İlk Yarı Sonucu");
        $msOranlar = $findRate("Maç Sonucu");
        $iy05Oranlar = $findRate("İlk Yarı Altı/Üstü 0,5");
        $iy15Oranlar = $findRate("İlk Yarı Altı/Üstü 1,5");
        $ms15Oranlar = $findRate("Altı/Üstü 1,5");
        $ms25Oranlar = $findRate("Altı/Üstü 2,5");
        $iyKGOranlar = $findRate("İlk Yarı Karşılıklı Gol");
        $msKGOranlar = $findRate("Karşılıklı Gol");

        $halfTimeHomeScore = $match['homeTeam']['scores']['HALF_TIME'] ?? 0;
        $halfTimeAwayScore = $match['awayTeam']['scores']['HALF_TIME'] ?? 0;
        $currentHomeScore = $match['homeTeam']['scores']['CURRENT'] ?? 0;
        $currentAwayScore = $match['awayTeam']['scores']['CURRENT'] ?? 0;

        $halfTimeScore = "{$halfTimeHomeScore}-{$halfTimeAwayScore}";
        $currentScore = "{$currentHomeScore}-{$currentAwayScore}";

        $rates = [
            'ilkYariOranlari' => [
                'ilkYariSonucu' => [
                    'home' => $iyOranlar['o'][0]['od'] ?? 'Oran yok',
                    'draw' => $iyOranlar['o'][1]['od'] ?? 'Oran yok',
                    'away' => $iyOranlar['o'][2]['od'] ?? 'Oran yok',
                ],
                'ilkYariKg' => [
                    'var' => $iyKGOranlar['o'][0]['od'] ?? 'Oran yok',
                    'yok' => $iyKGOranlar['o'][1]['od'] ?? 'Oran yok',
                ],
                'ilkYariAltUstu05' => [
                    'alt' => $iy05Oranlar['o'][0]['od'] ?? 'Oran yok',
                    'ust' => $iy05Oranlar['o'][1]['od'] ?? 'Oran yok',
                ],
                'ilkYariAltUstu15' => [
                    'alt' => $iy15Oranlar['o'][0]['od'] ?? 'Oran yok',
                    'ust' => $iy15Oranlar['o'][1]['od'] ?? 'Oran yok',
                ],
            ],
            'macGeneliOranlari' => [
                'macSonucu' => [
                    'home' => $msOranlar['o'][0]['od'] ?? 'Oran yok',
                    'draw' => $msOranlar['o'][1]['od'] ?? 'Oran yok',
                    'away' => $msOranlar['o'][2]['od'] ?? 'Oran yok',
                ],
                'macSonuKg' => [
                    'var' => $msKGOranlar['o'][0]['od'] ?? 'Oran yok',
                    'yok' => $msKGOranlar['o'][1]['od'] ?? 'Oran yok',
                ],
                'macSonucuAltUstu15' => [
                    'alt' => $ms15Oranlar['o'][0]['od'] ?? 'Oran yok',
                    'ust' => $ms15Oranlar['o'][1]['od'] ?? 'Oran yok',
                ],
                'macSonucuAltUstu25' => [
                    'alt' => $ms25Oranlar['o'][0]['od'] ?? 'Oran yok',
                    'ust' => $ms25Oranlar['o'][1]['od'] ?? 'Oran yok',
                ],
            ],
        ];

        $flagUrl = !empty($match['country']['iconPath'])
            ? "https://st4.misli.com" . $match['country']['iconPath']
            : "";

        // Parse date accurately from Misli format
        $rawDate = $match['date'] ?? $match['matchTime'] ?? null;
        if (is_numeric($rawDate)) {
            $ts = (strlen((string)$rawDate) > 10) ? (int)($rawDate / 1000) : (int)$rawDate;
            $startTime = date('Y-m-d H:i:s', $ts);
        } elseif (!empty($rawDate)) {
            $parsed = strtotime($rawDate);
            $startTime = ($parsed && $parsed > 0) ? date('Y-m-d H:i:s', $parsed) : now()->toDateTimeString();
        } else {
            $startTime = now()->toDateTimeString();
        }

        return [
            'league' => [
                'league_id' => (string) $match['tournament']['id'],
                'league_name' => $match['tournament']['name'] ?? 'Bilinmeyen Lig',
                'league_country' => $match['country']['misliName'] ?? '',
                'league_flag' => $flagUrl,
            ],
            'match' => [
                'match_id' => (string) $sgId,
                'match_sgId' => (string) $sgId,
                'league_id' => (string) $match['tournament']['id'],
                'match_home_team_name' => $match['homeTeam']['teamName'] ?? 'Takım bilgisi yok',
                'match_away_team_name' => $match['awayTeam']['teamName'] ?? 'Takım bilgisi yok',
                'match_home_logo' => $logos['home'] ?? '',
                'match_away_logo' => $logos['away'] ?? '',
                'match_half_time_score' => $halfTimeScore,
                'match_current_score' => $currentScore,
                'match_pen_score' => null,
                'match_startTime' => $startTime,
                'match_minute' => isset($match['minute']) ? (string)$match['minute'] : '0',
                'match_status' => $match['status'] ?? 'Bilinmiyor',
                'match_abbr' => $match['abbr'] ?? '',
                'match_broadcaster' => $singleDetail['tv'] ?? '',
                'match_red_cards' => [
                    'home' => $match['homeTeam']['redCards'] ?? 0,
                    'away' => $match['awayTeam']['redCards'] ?? 0,
                ],
                'match_rates' => $rates,
                'match_vendorType' => 'misli',
            ],
        ];
    }

    /**
     * Fetch match commentary or details from Broadage via Iddaa / Misli details
     */
    public function fetchMatchDetails(string $matchId): array
    {
        try {
            $response = Http::timeout(8)->get("https://statisticsv2.iddaa.com/broadage/getMatchCommentary", [
                'sportType' => 1,
                'broadageId' => $matchId,
            ]);

            if ($response->successful()) {
                return $response->json() ?? [];
            }
        } catch (\Throwable $e) {
            Log::error("fetchMatchDetails error for match {$matchId}: " . $e->getMessage());
        }

        return [];
    }
}
