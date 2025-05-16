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
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('plate_number', 50)->unique();
            $table->string('brand', 100)->nullable();
            $table->string('model', 100)->nullable();
            $table->string('color', 50)->nullable();
            $table->string('year', 4)->nullable();
            $table->string('chassis_number', 100)->unique()->nullable();
            $table->string('engine_number', 100)->unique()->nullable();
            $table->string('vehicle_type', 50)->nullable();
            $table->unsignedBigInteger('barangay_id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
