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
        Schema::create('pay_later_repayments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pay_later_bill_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('account_id')->nullable()->constrained()->nullOnDelete();
            $table->bigInteger('amount'); // integer Rupiah
            $table->date('repayment_date');
            $table->string('notes')->nullable();
            $table->timestamps();

            $table->index(['pay_later_bill_id']);
            $table->index(['user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pay_later_repayments');
    }
};
