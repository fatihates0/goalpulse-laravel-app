<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\MatchSyncService;

class SyncMisliLiveMatches extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'misli:sync-live';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Misli.com üzerinden canlı maç skorlarını ve oranlarını çekerek veritabanını günceller.';

    /**
     * Execute the console command.
     */
    public function handle(MatchSyncService $syncService): int
    {
        $this->info('Misli.com canlı veri senkronizasyonu başlatılıyor...');

        $synced = $syncService->syncLiveMatches();

        $this->info('Senkronizasyon tamamlandı! Toplam maç sayısı: ' . count($synced));

        return Command::SUCCESS;
    }
}
