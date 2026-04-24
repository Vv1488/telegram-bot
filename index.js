const TelegramBot = require('node-telegram-bot-api');
const TOKEN = '8771287795:AAGxcYP2Z0X8yFp6G-E6DEIbbl4B7FKdq6o
';
const АДМИН_ID = '7541394049';
const bot = new TelegramBot(TOKEN, { polling: true });

function главноеМеню(chatId) {
    bot.sendMessage(chatId, 'Выбери что тебя интересует:', {
        reply_markup: {
            keyboard: [
                ['💅 Услуги и цены', '📅 Записаться'],
                ['💆 Уход за ногтями', '📍 Адрес'],
                ['📞 Контакты']
            ],
            resize_keyboard: true
        }
    });
}

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Привет! 💅 Я бот Ярославы.');
    главноеМеню(msg.chat.id);
});

bot.on('message', (msg) => {
    if (!msg.text || msg.text.startsWith('/')) return;
    const chatId = msg.chat.id;
    const текст = msg.text;

    if (текст === '💅 Услуги и цены') {
        bot.sendMessage(chatId, '💅 Услуги и цены:\n\n• Маникюр — 300 грн\n• Маникюр + покрытие — 500 грн\n• Педикюр — 400 грн\n• Снятие покрытия — 100 грн');
    } else if (текст === '📅 Записаться') {
        bot.sendMessage(chatId, 'Выбери удобный день:', {
            reply_markup: {
                keyboard: [
                    ['Понедельник', 'Вторник', 'Среда'],
                    ['Четверг', 'Пятница', 'Суббота'],
                    ['🔙 Главное меню']
                ],
                resize_keyboard: true
            }
        });
    } else if (['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'].includes(текст)) {
        bot.sendMessage(chatId, 'Выбери удобное время:', {
            reply_markup: {
                keyboard: [
                    ['10:00', '12:00', '14:00'],
                    ['16:00', '18:00'],
                    ['🔙 Главное меню']
                ],
                resize_keyboard: true
            }
        });
    } else if (['10:00','12:00','14:00','16:00','18:00'].includes(текст)) {
        bot.sendMessage(chatId, '✅ Записала! Ярослава свяжется для подтверждения.\n📞 Телефон: +380 97 197 73 05');
        bot.sendMessage(АДМИН_ID, '📅 Новая запись!\nКлиент записался на время: ' + текст);
        главноеМеню(chatId);
    } else if (текст === '💆 Уход за ногтями') {
        bot.sendMessage(chatId, '💆 Советы по уходу:\n\n• Не мочить ногти 2 часа после покрытия\n• Используй масло для кутикулы каждый день\n• Не открывай банки ногтями 😄\n• Носи перчатки при уборке');
    } else if (текст === '📍 Адрес') {
        bot.sendMessage(chatId, '📍 Адрес: ул. Телевизионная 23, Днепр\n🕐 Часы работы: Пн-Сб 10:00 - 20:00');
    } else if (текст === '📞 Контакты') {
        bot.sendMessage(chatId, '📞 Телефон: +380 97 197 73 05\n📸 Инстаграм: @__gurova.nail__');
    } else if (текст === '🔙 Главное меню') {
        главноеМеню(chatId);
    }
});

console.log('Бот запущен!');
