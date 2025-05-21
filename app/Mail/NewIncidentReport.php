<?php

namespace App\Mail;

use App\Models\IncidentReport;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class NewIncidentReport extends Mailable
{
    use Queueable, SerializesModels;

    public $incident;

    /**
     * Create a new message instance.
     */
    public function __construct(IncidentReport $incident)
    {
        $this->incident = $incident;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('New Incident Report Submitted')
                    ->markdown('emails.new-incident-report');
    }
}
