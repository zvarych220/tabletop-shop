<?php
/**
 * Telegram Controller (Admin)
 * Dice & Deck Tabletop Shop
 */

require_once __DIR__ . '/../Services/TelegramService.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../Utils/Response.php';

class TelegramController
{
    private TelegramService $service;

    public function __construct()
    {
        $this->service = new TelegramService();
    }

    /**
     * Get Telegram settings
     * GET /api/admin/telegram
     *
     * @return void
     */
    public function getSettings(): void
    {
        $user = AuthMiddleware::requireAuth();
        AuthMiddleware::requireAdminOrManager($user);

        try {
            $settings = $this->service->getSettings();
            $token = $settings['botToken'];
            $maskedToken = '';
            if (!empty($token)) {
                $len = strlen($token);
                $maskedToken = substr($token, 0, 6) . str_repeat('•', max(0, $len - 12)) . substr($token, -6);
            }

            Response::success([
                'botToken' => $settings['botToken'],
                'maskedToken' => $maskedToken,
                'hasToken' => !empty($token),
                'adminChatId' => $settings['adminChatId'],
                'botUsername' => $settings['botUsername'],
                'notificationsEnabled' => (bool) $settings['notificationsEnabled'],
            ]);
        } catch (Exception $e) {
            error_log('Get Telegram settings error: ' . $e->getMessage());
            Response::serverError('Failed to fetch Telegram settings');
        }
    }

    /**
     * Save Telegram settings
     * POST /api/admin/telegram
     *
     * @param array $data
     * @return void
     */
    public function saveSettings(array $data): void
    {
        $user = AuthMiddleware::requireAuth();
        AuthMiddleware::requireAdminOrManager($user);

        try {
            $this->service->saveSettings($data);
            Response::success(null, 'Налаштування Telegram успішно збережено');
        } catch (Exception $e) {
            error_log('Save Telegram settings error: ' . $e->getMessage());
            Response::serverError('Failed to save Telegram settings');
        }
    }

    /**
     * Send test message
     * POST /api/admin/telegram/test
     *
     * @param array $data
     * @return void
     */
    public function test(array $data = []): void
    {
        $user = AuthMiddleware::requireAuth();
        AuthMiddleware::requireAdminOrManager($user);

        $chatId = !empty($data['chatId']) ? trim($data['chatId']) : null;
        $result = $this->service->sendTestMessage($chatId);

        if (!$result['success']) {
            Response::error($result['error'] ?? 'Не вдалося надіслати повідомлення', 400);
        }

        Response::success(null, 'Тестове повідомлення успішно надіслано в Telegram!');
    }
}
