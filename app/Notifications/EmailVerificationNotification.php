<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EmailVerificationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $verificationCode;
    protected $userName;

    /**
     * Create a new notification instance.
     */
    public function __construct($verificationCode, $userName)
    {
        $this->verificationCode = $verificationCode;
        $this->userName = $userName;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Kode Verifikasi Email - Masjid Taqwa Muhammadiyah')
            ->greeting("Assalamualaikum, {$this->userName}")
            ->line('Terima kasih telah mendaftar di sistem donasi Masjid Taqwa Muhammadiyah.')
            ->line('Berikut adalah kode verifikasi untuk akun Anda:')
            ->line('<div style="font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 30px 0; padding: 15px; background-color: #f5f5f5; border-radius: 8px;">' . $this->verificationCode . '</div>')
            ->line('Kode ini akan berlaku selama 60 menit.')
            ->line('Jika Anda tidak melakukan pendaftaran, silakan abaikan email ini.')
            ->salutation('Jazakallahu Khairan, Tim Masjid Taqwa Muhammadiyah');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'email_verification',
            'verification_code' => $this->verificationCode
        ];
    }
}
