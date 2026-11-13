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
        Schema::create('pay_later_bills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('provider_name');
            $table->string('description')->nullable();
            $table->bigInteger('total_amount'); // integer Rupiah
            $table->bigInteger('paid_amount')->default(0); // integer Rupiah
            $table->date('due_date');
            $table->string('status')->default('pending'); // 'pending', 'partially_paid', 'paid', 'overdue'
            $table->string('installment_info')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'due_date']);
            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pay_later_bills');
    }
};
