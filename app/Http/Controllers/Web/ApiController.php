<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;

class ApiController extends Controller
{
    /**
     * Display the REST API Documentation Portal
     */
    public function documentation(): Response
    {
        $endpoints = [
            [
                'id' => 'live-matches',
                'method' => 'GET',
                'path' => '/api/v1/matches/live',
                'title' => 'Canlı & Günlük Maçlar',
                'description' => 'Veritabanında bulunan tüm canlı ve günlük maçları lig bazında gruplanmış ve sıralanmış olarak döndürür.',
                'params' => [],
                'sample_response' => [
                    'status' => 'success',
                    'vendor' => 'misli',
                    'total_leagues' => 12,
                    'total_matches' => 178,
                    'leagues' => [
                        [
                            'league_id' => '101',
                            'league_name' => 'SÜPER LİG',
                            'league_country' => 'Türkiye',
                            'league_flag' => 'https://apivx.misli.com/flags/tr.png',
                            'matches' => [
                                [
                                    'match_id' => '984512',
                                    'match_home_team_name' => 'Galatasaray',
                                    'match_away_team_name' => 'Beşiktaş',
                                    'match_current_score' => '2-1',
                                    'match_half_time_score' => '1-0',
                                    'match_startTime' => '20:00',
                                    'match_minute' => '65',
                                    'is_live' => true,
                                    'is_finished' => false,
                                    'badge_text' => "65'",
                                    'match_rates' => [
                                        'macGeneliOranlari' => [
                                            'macSonucu' => ['home' => '1.85', 'draw' => '3.40', 'away' => '3.80']
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ],
            [
                'id' => 'matches-by-date',
                'method' => 'GET',
                'path' => '/api/v1/matches/date/{date?}',
                'title' => 'Tarihe Göre Maçlar',
                'description' => 'Belirtilen tarihteki (YYYY-MM-DD) maçları getirir. Eğer veritabanında o güne ait veri yoksa Misli.com servisi üzerinden otomatik senkronize edilir.',
                'params' => [
                    ['name' => 'date', 'type' => 'string (Path)', 'required' => false, 'description' => 'YYYY-MM-DD formatında tarih (ör. 2026-07-25). Boş bırakılırsa bugün getirilir.']
                ],
                'sample_response' => [
                    'status' => 'success',
                    'vendor' => 'misli',
                    'date' => '2026-07-25',
                    'total_leagues' => 8,
                    'total_matches' => 120,
                    'leagues' => []
                ]
            ],
            [
                'id' => 'match-details',
                'method' => 'GET',
                'path' => '/api/v1/matches/{id}/details',
                'title' => 'Maç Detay & Canlı Anlatım',
                'description' => 'Belirtilen maçın detaylı istatistiklerini, kadroları, canlı anlatım olaylarını (gol, kart vb.) ve oran geçmişini döndürür.',
                'params' => [
                    ['name' => 'id', 'type' => 'string (Path)', 'required' => true, 'description' => 'Benzersiz Misli match_id değeri']
                ],
                'sample_response' => [
                    'status' => 'success',
                    'match' => [
                        'match_id' => '984512',
                        'match_home_team_name' => 'Galatasaray',
                        'match_away_team_name' => 'Beşiktaş'
                    ],
                    'details' => [
                        'events' => [
                            ['minute' => '14', 'type' => 'GOAL', 'team' => 'home', 'player' => 'Icardi']
                        ]
                    ]
                ]
            ],
            [
                'id' => 'leagues',
                'method' => 'GET',
                'path' => '/api/v1/leagues',
                'title' => 'Tüm Ligler',
                'description' => 'Sistemdeki tüm aktif ligleri, ülke bilgilerini ve o ligdeki toplam maç sayılarını döndürür.',
                'params' => [],
                'sample_response' => [
                    'status' => 'success',
                    'total_leagues' => 24,
                    'leagues' => [
                        ['league_id' => '101', 'league_name' => 'SÜPER LİG', 'matches_count' => 10]
                    ]
                ]
            ],
            [
                'id' => 'subscribe',
                'method' => 'POST',
                'path' => '/api/v1/subscribe',
                'title' => 'Bildirim Aboneliği',
                'description' => 'Mobil uygulama veya Web Push bildirimleri için PushSubscription kaydı oluşturur.',
                'params' => [
                    ['name' => 'endpoint', 'type' => 'string (JSON)', 'required' => true, 'description' => 'Push servisi endpoint URL adresi'],
                    ['name' => 'keys', 'type' => 'object (JSON)', 'required' => true, 'description' => 'p256dh ve auth anahtarları'],
                    ['name' => 'topic', 'type' => 'string (JSON)', 'required' => false, 'description' => 'Bildirim konusu (ör. tum_bildirimler)']
                ],
                'sample_response' => [
                    'status' => 'success',
                    'subscription' => ['id' => 1, 'endpoint' => 'https://fcm.googleapis.com/...']
                ]
            ],
            [
                'id' => 'unsubscribe',
                'method' => 'POST',
                'path' => '/api/v1/unsubscribe',
                'title' => 'Abonelik Kaldırma',
                'description' => 'Cihazın bildirim aboneliğini sistemden kaldırır.',
                'params' => [
                    ['name' => 'endpoint', 'type' => 'string (JSON)', 'required' => true, 'description' => 'Aboneliğe ait endpoint URL']
                ],
                'sample_response' => [
                    'status' => 'success',
                    'message' => 'Abonelik kaldırıldı'
                ]
            ],
            [
                'id' => 'vendor-type',
                'method' => 'GET',
                'path' => '/api/v1/vendor-type',
                'title' => 'Veri Sağlayıcı Bilgisi',
                'description' => 'Sistemin aktif veri kaynağını (Misli.com) ve servis durumunu döndürür.',
                'params' => [],
                'sample_response' => [
                    'vendor' => 'misli',
                    'status' => 'active',
                    'description' => 'Yalnızca Misli.com verileri aktif olarak kullanılmaktadır.'
                ]
            ],
            [
                'id' => 'trigger-sync',
                'method' => 'POST',
                'path' => '/api/v1/sync',
                'title' => 'Canlı Senkronizasyon Tetikleme',
                'description' => 'Arka plan Cron/Worker servisleri için Misli.com veri eşitlemesini manuel tetikler.',
                'params' => [],
                'sample_response' => [
                    'status' => 'success',
                    'total_synced' => 178
                ]
            ]
        ];

        return Inertia::render('ApiDocs', [
            'endpoints' => $endpoints,
            'baseUrl' => url('/'),
        ]);
    }
}
