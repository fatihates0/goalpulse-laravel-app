<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\League;
use App\Models\FootballMatch;
use App\Models\Subscribe;
use App\Services\MatchSyncService;
use App\Services\MisliApiService;
use App\Services\LeagueSorter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class MatchController extends Controller
{
    protected MatchSyncService $syncService;
    protected MisliApiService $misliApiService;

    public function __construct(MatchSyncService $syncService, MisliApiService $misliApiService)
    {
        $this->syncService = $syncService;
        $this->misliApiService = $misliApiService;
    }

    /**
     * Mobile & Web API: Get Live Matches (DB-First for extreme speed)
     */
    public function liveMatches(Request $request): JsonResponse
    {
        $today = Carbon::today();
        $startOfDay = $today->copy()->startOfDay()->subHours(2);
        $endOfDay = $today->copy()->endOfDay()->addHours(4);

        $leagues = League::with(['matches' => function ($query) use ($startOfDay, $endOfDay) {
            $query->whereBetween('match_startTime', [$startOfDay, $endOfDay])
                  ->orderBy('match_startTime', 'asc');
        }])->get();

        $formattedLeagues = [];
        $totalMatches = 0;

        foreach ($leagues as $league) {
            if ($league->matches->isEmpty()) {
                continue;
            }

            $totalMatches += $league->matches->count();
            $formattedLeagues[] = [
                'league_id' => $league->league_id,
                'league_name' => $league->league_name,
                'league_country' => $league->league_country,
                'league_flag' => $league->league_flag,
                'matches' => $league->matches->map(function ($m) {
                    $state = $m->determineState();
                    return [
                        'match_id' => $m->match_id,
                        'match_sgId' => $m->match_sgId,
                        'match_home_team_name' => $m->match_home_team_name,
                        'match_away_team_name' => $m->match_away_team_name,
                        'match_home_logo' => $m->match_home_logo,
                        'match_away_logo' => $m->match_away_logo,
                        'match_half_time_score' => $m->match_half_time_score,
                        'match_current_score' => $m->match_current_score,
                        'match_pen_score' => $m->match_pen_score,
                        'match_startTime' => $m->match_startTime ? $m->match_startTime->format('H:i') : '--:--',
                        'match_minute' => $m->match_minute,
                        'match_status' => $m->match_status,
                        'match_abbr' => $m->match_abbr,
                        'match_broadcaster' => $m->match_broadcaster,
                        'match_red_cards' => $m->match_red_cards,
                        'match_rates' => $m->match_rates,
                        'match_vendorType' => $m->match_vendorType,
                        'is_live' => $state['is_live'],
                        'is_finished' => $state['is_finished'],
                        'is_postponed' => $state['is_postponed'],
                        'is_cancelled' => $state['is_cancelled'],
                        'badge_text' => $state['badge_text'],
                    ];
                })->toArray(),
            ];
        }

        $sorted = LeagueSorter::sortLeagues($formattedLeagues);

        return response()->json([
            'status' => 'success',
            'vendor' => 'misli',
            'total_leagues' => count($sorted),
            'total_matches' => $totalMatches,
            'leagues' => $sorted,
        ]);
    }

    public function matchesByDate(Request $request, ?string $date = null): JsonResponse
    {
        $rawDate = $date ?? $request->get('date', now()->format('Y-m-d'));

        try {
            if (str_contains($rawDate, '/')) {
                $parts = explode('/', $rawDate);
                $targetDate = Carbon::createFromDate($parts[2], $parts[1], $parts[0]);
            } else {
                $targetDate = Carbon::parse($rawDate);
            }
        } catch (\Throwable $e) {
            $targetDate = Carbon::today();
        }

        $dateStr = $targetDate->format('Y-m-d');
        $startOfDay = $targetDate->copy()->startOfDay()->subHours(2);
        $endOfDay = $targetDate->copy()->endOfDay()->addHours(4);

        $existingMatches = FootballMatch::whereBetween('match_startTime', [$startOfDay, $endOfDay])->count();
        if ($existingMatches === 0) {
            $this->syncService->syncLiveMatches($dateStr);
        }

        $leagues = League::with(['matches' => function ($q) use ($startOfDay, $endOfDay) {
            $q->whereBetween('match_startTime', [$startOfDay, $endOfDay])
              ->orderBy('match_startTime', 'asc');
        }])->get();

        $formattedLeagues = [];
        $totalMatches = 0;

        foreach ($leagues as $league) {
            if ($league->matches->isEmpty()) continue;

            $totalMatches += $league->matches->count();
            $formattedLeagues[] = [
                'league_id' => $league->league_id,
                'league_name' => $league->league_name,
                'league_country' => $league->league_country,
                'league_flag' => $league->league_flag,
                'matches' => $league->matches->map(function ($m) {
                    $arr = $m->toArray();
                    $state = $m->determineState();
                    $arr['match_startTime'] = $m->match_startTime ? $m->match_startTime->format('H:i') : '--:--';
                    $arr['is_live'] = $state['is_live'];
                    $arr['is_finished'] = $state['is_finished'];
                    $arr['is_postponed'] = $state['is_postponed'];
                    $arr['is_cancelled'] = $state['is_cancelled'];
                    $arr['badge_text'] = $state['badge_text'];
                    return $arr;
                })->toArray(),
            ];
        }

        $sorted = LeagueSorter::sortLeagues($formattedLeagues);

        return response()->json([
            'status' => 'success',
            'vendor' => 'misli',
            'date' => $dateStr,
            'total_leagues' => count($sorted),
            'total_matches' => $totalMatches,
            'leagues' => $sorted,
        ]);
    }

    /**
     * Mobile & Web API: Match Details / Commentary
     */
    public function matchDetails(Request $request, string $id = null): JsonResponse
    {
        $matchId = $id ?? $request->get('match_id');

        if (!$matchId) {
            return response()->json(['status' => 'error', 'message' => 'match_id parametresi gereklidir'], 400);
        }

        $details = $this->misliApiService->fetchMatchDetails($matchId);
        $matchInfo = FootballMatch::where('match_id', $matchId)->first();

        return response()->json([
            'status' => 'success',
            'match' => $matchInfo,
            'details' => $details,
        ]);
    }

    /**
     * Mobile & Web API: Get All Leagues
     */
    public function leagues(): JsonResponse
    {
        $leagues = League::withCount('matches')->get()->toArray();
        $sorted = LeagueSorter::sortLeagues($leagues);

        return response()->json([
            'status' => 'success',
            'total_leagues' => count($sorted),
            'leagues' => $sorted,
        ]);
    }

    /**
     * Subscribe Push Notifications
     */
    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => 'required|string',
            'keys' => 'required|array',
            'topic' => 'nullable|string',
        ]);

        $sub = Subscribe::create([
            'endpoint' => $validated['endpoint'],
            'keys' => $validated['keys'],
            'topic' => $validated['topic'] ?? 'tum_bildirimler',
            'expirationTime' => $request->get('expirationTime'),
        ]);

        return response()->json(['status' => 'success', 'subscription' => $sub], 201);
    }

    /**
     * Unsubscribe Push Notifications
     */
    public function unsubscribe(Request $request): JsonResponse
    {
        $endpoint = $request->get('endpoint');
        if ($endpoint) {
            Subscribe::where('endpoint', $endpoint)->delete();
        }

        return response()->json(['status' => 'success', 'message' => 'Abonelik kaldırıldı']);
    }

    /**
     * Get Active Vendor Type
     */
    public function vendorType(): JsonResponse
    {
        return response()->json([
            'vendor' => 'misli',
            'status' => 'active',
            'description' => 'Yalnızca Misli.com verileri aktif olarak kullanılmaktadır.',
        ]);
    }

    /**
     * Explicit trigger for sync (For Cron / Worker)
     */
    public function triggerSync(): JsonResponse
    {
        $synced = $this->syncService->syncLiveMatches();
        return response()->json([
            'status' => 'success',
            'total_synced' => count($synced),
        ]);
    }
}
