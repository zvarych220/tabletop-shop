<?php
/**
 * Telegram Notification Service
 * Dice & Deck Tabletop Shop
 */

require_once __DIR__ . '/../../config/database.php';

class TelegramService
{
    private PDO $db;

    public function __construct()
    {
        $this->db = getDbConnection();
    }

    /**
     * Get all Telegram settings from database or environment
     *
     * @return array
     */
    public function getSettings(): array
    {
        try {
            $stmt = $this->db->query("SELECT `key`, `value` FROM settings WHERE `key` LIKE 'telegram_%'");
            $rows = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        } catch (Exception $e) {
            $rows = [];
        }

        return [
            'botToken' => $rows['telegram_bot_token'] ?? getenv('TELEGRAM_BOT_TOKEN') ?: '',
            'adminChatId' => $rows['telegram_admin_chat_id'] ?? getenv('TELEGRAM_ADMIN_CHAT_ID') ?: '',
            'botUsername' => $rows['telegram_bot_username'] ?? getenv('TELEGRAM_BOT_USERNAME') ?: '',
            'notificationsEnabled' => isset($rows['telegram_notifications_enabled'])
                ? (bool) $rows['telegram_notifications_enabled']
                : true,
        ];
    }

    /**
     * Save Telegram settings to database
     *
     * @param array $settings
     * @return bool
     */
    public function saveSettings(array $settings): bool
    {
        $fields = [
            'telegram_bot_token' => trim($settings['botToken'] ?? ''),
            'telegram_admin_chat_id' => trim($settings['adminChatId'] ?? ''),
            'telegram_bot_username' => ltrim(trim($settings['botUsername'] ?? ''), '@'),
            'telegram_notifications_enabled' => !empty($settings['notificationsEnabled']) ? '1' : '0',
        ];

        $stmt = $this->db->prepare("
            INSERT INTO settings (`key`, `value`)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), `updated_at` = NOW()
        ");

        foreach ($fields as $key => $val) {
            $stmt->execute([$key, $val]);
        }

        return true;
    }

    /**
     * Send raw HTML message via Telegram Bot API
     *
     * @param string $chatId
     * @param string $message
     * @return array ['success' => bool, 'error' => string|null]
     */
    public function sendMessage(string $chatId, string $message): array
    {
        $chatId = trim($chatId);
        if (empty($chatId)) {
            return ['success' => false, 'error' => 'Chat ID is empty'];
        }

        $settings = $this->getSettings();
        if (empty($settings['botToken'])) {
            return ['success' => false, 'error' => 'Telegram Bot Token is not configured'];
        }

        if (!$settings['notificationsEnabled']) {
            return ['success' => false, 'error' => 'Telegram notifications are disabled in settings'];
        }

        $url = "https://api.telegram.org/bot" . $settings['botToken'] . "/sendMessage";

        $postData = [
            'chat_id' => $chatId,
            'text' => $message,
            'parse_mode' => 'HTML',
            'disable_web_page_preview' => true,
        ];

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query($postData),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_TIMEOUT => 6,
        ]);

        $rawResponse = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            error_log("Telegram cURL error: " . $curlError);
            return ['success' => false, 'error' => $curlError];
        }

        $json = json_decode($rawResponse, true);
        if ($httpCode !== 200 || empty($json['ok'])) {
            $desc = $json['description'] ?? "HTTP error {$httpCode}";
            error_log("Telegram API error: {$desc}");
            return ['success' => false, 'error' => $desc];
        }

        return ['success' => true, 'result' => $json['result'] ?? null];
    }

    /**
     * Notify Admin about a new placed order
     *
     * @param array $order
     * @param array $items
     * @return void
     */
    public function notifyAdminNewOrder(array $order, array $items = []): void
    {
        $settings = $this->getSettings();
        $adminChatId = $settings['adminChatId'];
        if (empty($adminChatId)) {
            return;
        }

        $deliveryLabels = [
            'nova_poshta' => 'Нова Пошта',
            'ukr_poshta' => 'Укрпошта',
        ];
        $delivery = $deliveryLabels[$order['deliveryService'] ?? ''] ?? $order['deliveryService'] ?? 'Самовивіз';

        $paymentLabels = [
            'cash_on_delivery' => 'При отриманні (накладений платіж)',
            'online' => 'Онлайн (карткою)',
        ];
        $payment = $paymentLabels[$order['paymentMethod'] ?? ''] ?? $order['paymentMethod'] ?? 'Готівка';

        $itemsText = '';
        foreach ($items as $it) {
            $title = htmlspecialchars($it['title'] ?? 'Гра', ENT_QUOTES, 'UTF-8');
            $qty = (int) ($it['quantity'] ?? 1);
            $price = (float) ($it['price'] ?? 0);
            $subtotal = $qty * $price;
            $itemsText .= "• <b>{$title}</b> × {$qty} — {$subtotal} ₴\n";
        }

        if (empty($itemsText)) {
            $itemsText = "• Настільна гра\n";
        }

        $commentBlock = '';
        if (!empty($order['comment'])) {
            $safeComment = htmlspecialchars($order['comment'], ENT_QUOTES, 'UTF-8');
            $commentBlock = "\n💬 <b>Коментар:</b> <i>«{$safeComment}»</i>\n";
        }

        $telegramCustomer = '';
        if (!empty($order['telegramChatId'])) {
            $telegramCustomer = "\n📱 <b>Telegram клієнта (Chat ID):</b> <code>{$order['telegramChatId']}</code>";
        }

        $fullName = htmlspecialchars($order['fullName'] ?? 'Клієнт', ENT_QUOTES, 'UTF-8');
        $phone = htmlspecialchars($order['phone'] ?? '—', ENT_QUOTES, 'UTF-8');
        $city = htmlspecialchars($order['city'] ?? '', ENT_QUOTES, 'UTF-8');
        $branch = htmlspecialchars($order['branch'] ?? '', ENT_QUOTES, 'UTF-8');
        $total = number_format((float) ($order['totalPrice'] ?? 0), 2, '.', ' ');

        $message = "🔥 <b>НОВЕ ЗАМОВЛЕННЯ #{$order['id']}</b>\n\n"
            . "👤 <b>Покупець:</b> {$fullName}\n"
            . "📞 <b>Телефон:</b> {$phone}{$telegramCustomer}\n"
            . "🚚 <b>Доставка:</b> {$delivery}, м. {$city}, {$branch}\n"
            . "💳 <b>Оплата:</b> {$payment}\n"
            . "{$commentBlock}\n"
            . "🛒 <b>Товари:</b>\n{$itemsText}\n"
            . "💰 <b>РАЗОМ ДО СПЛАТИ:</b> <b>{$total} ₴</b>\n\n"
            . "👉 <i>Переглянути в адмінці: /admin/orders</i>";

        $this->sendMessage($adminChatId, $message);
    }

    /**
     * Notify Customer that order was successfully placed
     *
     * @param array $order
     * @param array $items
     * @return void
     */
    public function notifyUserOrderCreated(array $order, array $items = []): void
    {
        $chatId = $order['telegramChatId'] ?? null;
        if (empty($chatId)) {
            return;
        }

        $itemsText = '';
        foreach ($items as $it) {
            $title = htmlspecialchars($it['title'] ?? 'Гра', ENT_QUOTES, 'UTF-8');
            $qty = (int) ($it['quantity'] ?? 1);
            $price = (float) ($it['price'] ?? 0);
            $subtotal = $qty * $price;
            $itemsText .= "• {$title} × {$qty} = {$subtotal} ₴\n";
        }

        $total = number_format((float) ($order['totalPrice'] ?? 0), 2, '.', ' ');
        $city = htmlspecialchars($order['city'] ?? '', ENT_QUOTES, 'UTF-8');
        $branch = htmlspecialchars($order['branch'] ?? '', ENT_QUOTES, 'UTF-8');

        $message = "🎉 <b>Дякуємо за ваше замовлення в Dice & Deck!</b>\n\n"
            . "Ваше замовлення <code>#{$order['id']}</code> успішно прийнято.\n"
            . "Поточний статус: 🟡 <b>Очікує підтвердження</b>\n\n"
            . "🛒 <b>Склад замовлення:</b>\n{$itemsText}\n"
            . "💰 <b>Сума:</b> <b>{$total} ₴</b>\n"
            . "📍 <b>Адреса доставки:</b> м. {$city}, {$branch}\n\n"
            . "ℹ️ <i>Ми надішлемо вам повідомлення сюди, щойно статус замовлення зміниться!</i> 🎲";

        $this->sendMessage($chatId, $message);
    }

    /**
     * Notify Customer when their order status changes
     *
     * @param array $order
     * @param string $newStatus
     * @param array $items
     * @return void
     */
    public function notifyUserOrderStatusChanged(array $order, string $newStatus, array $items = []): void
    {
        $chatId = $order['telegramChatId'] ?? null;
        if (empty($chatId)) {
            return;
        }

        $statusMap = [
            'pending' => '🟡 Очікує підтвердження',
            'processing' => '🔵 В обробці (комплектується / готується до відправки)',
            'completed' => '🟢 Виконано (відправлено покупцеві)',
            'cancelled' => '🔴 Скасовано',
        ];

        $statusTitle = $statusMap[$newStatus] ?? "ℹ️ " . ucfirst($newStatus);

        $itemsText = '';
        foreach ($items as $it) {
            $title = htmlspecialchars($it['title'] ?? 'Гра', ENT_QUOTES, 'UTF-8');
            $qty = (int) ($it['quantity'] ?? 1);
            $price = (float) ($it['price'] ?? 0);
            $itemsText .= "• {$title} (×{$qty})\n";
        }

        $total = number_format((float) ($order['totalPrice'] ?? 0), 2, '.', ' ');

        $message = "🔔 <b>Оновлення статусу замовлення!</b>\n\n"
            . "Номер замовлення: <code>#{$order['id']}</code>\n"
            . "Новий статус: <b>{$statusTitle}</b>\n\n"
            . (!empty($itemsText) ? "📦 <b>Товари в замовленні:</b>\n{$itemsText}\n" : "")
            . "💰 <b>Сума замовлення:</b> <b>{$total} ₴</b>\n\n"
            . "🎲 <i>Дякуємо, що граєте разом із Dice & Deck!</i>";

        $this->sendMessage($chatId, $message);
    }

    /**
     * Notify Admin about a new review awaiting moderation
     *
     * @param array $review
     * @param string $productTitle
     * @return void
     */
    public function notifyAdminNewReview(array $review, string $productTitle = ''): void
    {
        $settings = $this->getSettings();
        $adminChatId = $settings['adminChatId'];
        if (empty($adminChatId)) {
            return;
        }

        $rating = (int) ($review['rating'] ?? 5);
        $stars = str_repeat('⭐', max(1, min(5, $rating)));
        $author = htmlspecialchars($review['authorName'] ?? 'Гість', ENT_QUOTES, 'UTF-8');
        $game = htmlspecialchars($productTitle ?: ($review['productId'] ?? 'Настільна гра'), ENT_QUOTES, 'UTF-8');
        $comment = htmlspecialchars($review['comment'] ?? '', ENT_QUOTES, 'UTF-8');

        $message = "⭐ <b>НОВИЙ ВІДГУК НА МОДЕРАЦІЮ</b>\n\n"
            . "🎲 <b>Гра:</b> {$game}\n"
            . "👤 <b>Автор:</b> {$author}\n"
            . "🌟 <b>Оцінка:</b> {$stars} ({$rating}/5)\n\n"
            . "💬 <b>Відгук:</b>\n<i>«{$comment}»</i>\n\n"
            . "👉 <i>Схвалити або відхилити можна в адмінці: /admin/reviews</i>";

        $this->sendMessage($adminChatId, $message);
    }

    /**
     * Test message to verify Telegram credentials
     *
     * @param string|null $targetChatId
     * @return array
     */
    public function sendTestMessage(?string $targetChatId = null): array
    {
        $settings = $this->getSettings();
        $chatId = $targetChatId ?: $settings['adminChatId'];

        if (empty($chatId)) {
            return ['success' => false, 'error' => 'Вкажіть Chat ID для відправки тестового повідомлення'];
        }

        $testText = "🤖 <b>Вітаємо!</b>\n\n"
            . "Тестове повідомлення від Telegram-бота магазину <b>Dice & Deck</b>.\n"
            . "Інтеграція працює належним чином! Тепер ви отримуватимете сповіщення про замовлення та відгуки.";

        return $this->sendMessage($chatId, $testText);
    }
}
