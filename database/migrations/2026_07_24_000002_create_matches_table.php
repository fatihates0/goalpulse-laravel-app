<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('matches', function (Blueprint $table) {
            $table->id();
            $table->string('match_id')->unique();
            $table->string('match_sgId')->nullable();
            $table->string('league_id');
            $table->string('match_home_team_name');
            $table->string('match_away_team_name');
            $table->string('match_home_logo')->nullable();
            $table->string('match_away_logo')->nullable();
            $table->string('match_half_time_score')->default('0-0');
            $table->string('match_current_score')->default('0-0');
            $table->string('match_pen_score')->nullable();
            $table->dateTime('match_startTime')->nullable();
            $table->string('match_minute')->default('0');
            $table->string('match_status')->default('NS');
            $table->string('match_abbr')->nullable();
            $table->string('match_broadcaster')->nullable();
            $table->json('match_red_cards')->nullable();
            $table->json('match_rates')->nullable();
            $table->string('match_vendorType')->default('misli');
            $table->timestamps();

            $table->foreign('league_id')->references('league_id')->on('leagues')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('matches');
    }
};
