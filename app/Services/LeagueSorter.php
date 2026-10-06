<?php

namespace App\Services;

class LeagueSorter
{
    public const MAJOR_LEAGUES_PRIORITY = [
        // 🇹🇷 Türkiye Ligleri
        "Trendyol Süper Lig",
        "Türkiye Süper Lig",
        "Süper Lig",
        "Trendyol 1. Lig",
        "Türkiye 1. Lig",
        "1. Lig",
        "Ziraat Türkiye Kupası",
        "Türkiye Kupası",

        // 🏆 Avrupa Kupaları
        "UEFA Champions League",
        "UEFA Şampiyonlar Ligi",
        "Şampiyonlar Ligi",
        "UEFA Europa League",
        "UEFA Avrupa Ligi",
        "Avrupa Ligi",
        "UEFA Conference League",
        "UEFA Konferans Ligi",
        "UEFA Avrupa Konferans Ligi",

        // ⚽ Major Dünya Ligleri
        "Premier League",
        "İngiltere Premier Lig",
        "LaLiga",
        "İspanya La Liga",
        "Serie A",
        "İtalya Serie A",
        "Bundesliga",
        "Almanya Bundesliga",
        "Ligue 1",
        "Fransa Ligue 1",
        "Eredivisie",
        "Primeira Liga",
        "MLS",
        "Major League Soccer",

        // 🌍 Diğer Popüler Turnuvalar
        "Dünya Kupası",
        "Euro 2024",
        "Avrupa Şampiyonası",
        "Copa America",
        "Kulüplerarası Hazırlık Maçları",
    ];

    public static function getPriority($league): int
    {
        if (is_array($league)) {
            $name = mb_strtolower(trim($league['league_name'] ?? ''));
            $country = mb_strtolower(trim($league['league_country'] ?? ''));
        } elseif (is_object($league)) {
            $name = mb_strtolower(trim($league->league_name ?? ''));
            $country = mb_strtolower(trim($league->league_country ?? ''));
        } else {
            return 999999;
        }

        // 1. Tam Eşleşme
        foreach (self::MAJOR_LEAGUES_PRIORITY as $index => $targetStr) {
            $target = mb_strtolower(trim($targetStr));
            if ($name === $target) {
                return $index;
            }
        }

        // 2. Kısmi Eşleşme
        $bestMatchIndex = 999999;
        $bestMatchLength = 0;

        foreach (self::MAJOR_LEAGUES_PRIORITY as $index => $targetStr) {
            $target = mb_strtolower(trim($targetStr));

            if ($target === "süper lig" || $target === "1. lig") {
                if ((str_contains($country, 'türkiye') || str_contains($country, 'turkey') || str_contains($name, 'türkiye')) && str_contains($name, $target)) {
                    if (mb_strlen($target) > $bestMatchLength) {
                        $bestMatchLength = mb_strlen($target);
                        $bestMatchIndex = $index;
                    }
                }
                continue;
            }

            if (str_contains($name, $target)) {
                if (mb_strlen($target) > $bestMatchLength) {
                    $bestMatchLength = mb_strlen($target);
                    $bestMatchIndex = $index;
                }
            }
        }

        return $bestMatchIndex;
    }

    public static function sortLeagues(array $leagues): array
    {
        usort($leagues, function ($a, $b) {
            $prioA = self::getPriority($a);
            $prioB = self::getPriority($b);

            if ($prioA !== $prioB) {
                return $prioA <=> $prioB;
            }

            $countryA = is_array($a) ? ($a['league_country'] ?? '') : ($a->league_country ?? '');
            $countryB = is_array($b) ? ($b['league_country'] ?? '') : ($b->league_country ?? '');

            $cComp = strcmp($countryA, $countryB);
            if ($cComp !== 0) return $cComp;

            $nameA = is_array($a) ? ($a['league_name'] ?? '') : ($a->league_name ?? '');
            $nameB = is_array($b) ? ($b['league_name'] ?? '') : ($b->league_name ?? '');

            return strcmp($nameA, $nameB);
        });

        return $leagues;
    }
}
