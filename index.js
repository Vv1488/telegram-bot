const TelegramBot = require('node-telegram-bot-api');

const TOKEN = '8771287795:AAGxcYP2Z0X8yFp6G-E6DEIbbl4B7FKdq6o';
const bot = new TelegramBot(TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Привет! 💅 Я бот Ярославы. Выбери что тебя интересует:', {
        reply_markup: {
            keyboard: [
                ['💅 Услуги и цены', '📅 Записаться'],
                ['💆 Уход за ногтями', '📍 Адрес'],
                ['📞 Контакты']
            ],
            resize_keyboard: true
        }
    });
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const текст = msg.text;

    if (текст === '💅 Услуги и цены') {
        bot.sendMessage(chatId, '💅 Услуги и цены:\n\n• Маникюр — 300 грн\n• Маникюр + покрытие — 500 грн\n• Педикюр — 400 грн\n• Снятие покрытия — 100 грн');
    } else if (текст === '📅 Записаться') {
        bot.sendMessage(chatId, 'Для записи напиши желаемый день и время, например:\nПятница в 15:00\n\nИли позвони: +380 97 197 73 05');
    } else if (текст === '💆 Уход за ногтями') {
        bot.sendMessage(chatId, '💆 Советы по уходу:\n\n• Не мочить ногти 2 часа после покрытия\n• Используй масло для кутикулы каждый день\n• Не открывай банки ногтями 😄\n• Носи перчатки при уборке');
    } else if (текст === '📍 Адрес') {
        bot.sendMessage(chatId, '📍 Адрес: ул. Телевизионная 23, Днепр\n🕐 Часы работы: Пн-Сб 10:00 - 20:00');
    } else if (текст === '📞 Контакты') {
        bot.sendMessage(chatId, '📞 Телефон: +380 97 197 73 05\n📸 Инстаграм: @__gurova.nail__');
    }
});

console.log('Бот запущен!');
