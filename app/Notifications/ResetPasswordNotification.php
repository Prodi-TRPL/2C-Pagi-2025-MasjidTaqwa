<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $resetCode;
    protected $userName;

    /**
     * Create a new notification instance.
     */
    public function __construct($resetCode, $userName)
    {
        $this->resetCode = $resetCode;
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
            ->subject('Kode Reset Kata Sandi - Masjid Taqwa Muhammadiyah')
            ->greeting("Assalamualaikum, {$this->userName}")
            ->line('Anda menerima email ini karena kami menerima permintaan untuk reset kata sandi akun Anda.')
            ->line('Berikut adalah kode untuk reset kata sandi Anda:')
            ->line('============================')
            ->line($this->resetCode)
            ->line('============================')
            ->line('Kode ini akan berlaku selama 60 menit.')
            ->line('Jika Anda tidak meminta reset kata sandi, silakan abaikan email ini.')
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
            'type' => 'reset_password',
            'reset_code' => $this->resetCode
        ];
    }
}
