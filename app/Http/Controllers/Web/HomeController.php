<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\League;
use App\Models\FootballMatch;
use App\Services\MatchSyncService;
use App\Services\LeagueSorter;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Carbon\Carbon;

class HomeController extends Controller
{
    protected MatchSyncService $syncService;

    public function __construct(MatchSyncService $syncService)
    {
        $this->syncService = $syncService;
    }

    public function index(Request $request): Response
    {
        $selectedTab = $request->get('tab', 'all'); // default to 'all'
        $rawDate = $request->get('date', now()->format('Y-m-d'));

        // Parse selected date
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

        // Check if DB has matches for requested date; if empty, sync for that date
        $existingMatches = FootballMatch::whereBetween('match_startTime', [$startOfDay, $endOfDay])->count();
        if ($existingMatches === 0) {
            $this->syncService->syncLiveMatches($dateStr);
        }

        // Query matches for selected date
        $leagues = League::with(['matches' => function ($q) use ($startOfDay, $endOfDay) {
            $q->whereBetween('match_startTime', [$startOfDay, $endOfDay])
              ->orderBy('match_startTime', 'asc');
        }])->get();

        $formattedLeagues = [];
        $totalMatches = 0;
        $liveCount = 0;
        $finishedCount = 0;

        foreach ($leagues as $league) {
            if ($league->matches->isEmpty()) continue;

            $matchesList = [];
            foreach ($league->matches as $m) {
                $state = $m->determineState();

                if ($state['is_live']) $liveCount++;
                if ($state['is_finished']) $finishedCount++;

                $timeOnly = '--:--';
                if ($m->match_startTime) {
                    try {
                        $timeOnly = $m->match_startTime->format('H:i');
                    } catch (\Throwable $e) {
                        $timeOnly = substr((string)$m->match_startTime, 11, 5) ?: '--:--';
                    }
                }

                $matchesList[] = [
                    'match_id' => $m->match_id,
                    'match_sgId' => $m->match_sgId,
                    'match_home_team_name' => $m->match_home_team_name,
                    'match_away_team_name' => $m->match_away_team_name,
                    'match_home_logo' => $m->match_home_logo,
                    'match_away_logo' => $m->match_away_logo,
                    'match_half_time_score' => $m->match_half_time_score,
                    'match_current_score' => $m->match_current_score,
                    'match_pen_score' => $m->match_pen_score,
                    'match_startTime' => $timeOnly,
                    'match_minute' => $m->match_minute,
                    'match_status' => $m->match_status,
                    'match_abbr' => $m->match_abbr,
                    'match_broadcaster' => $m->match_broadcaster,
                    'match_red_cards' => $m->match_red_cards ?? ['home' => 0, 'away' => 0],
                    'match_rates' => $m->match_rates,
                    'is_live' => $state['is_live'],
                    'is_finished' => $state['is_finished'],
                    'is_postponed' => $state['is_postponed'],
                    'is_cancelled' => $state['is_cancelled'],
                    'badge_text' => $state['badge_text'],
                ];
            }

            if (!empty($matchesList)) {
                $totalMatches += count($matchesList);
                $formattedLeagues[] = [
                    'league_id' => $league->league_id,
                    'league_name' => $league->league_name,
                    'league_country' => $league->league_country,
                    'league_flag' => $league->league_flag,
                    'matches' => $matchesList,
                ];
            }
        }

        $sortedLeagues = LeagueSorter::sortLeagues($formattedLeagues);

        return Inertia::render('Home', [
            'leagues' => $sortedLeagues,
            'stats' => [
                'total_matches' => $totalMatches,
                'live_count' => $liveCount,
                'finished_count' => $finishedCount,
            ],
            'filters' => [
                'tab' => $selectedTab,
                'date' => $dateStr,
            ],
        ]);
    }
}
