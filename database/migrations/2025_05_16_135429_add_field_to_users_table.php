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
        Schema::table('users', function (Blueprint $table) {
            $table->enum('user_type', ['admin','barangay_admin', 'driver'])->default('barangay_admin')->after('password');
            $table->unsignedBigInteger('barangay_id')->nullable()->after('user_type');
            $table->boolean('is_active')->default(true)->after('barangay_id');
            $table->boolean('superadmin')->default(false)->after('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('user_type');
            $table->dropColumn('barangay_id');
            $table->dropColumn('is_active');
            $table->dropColumn('superadmin');
        });
    }
};
