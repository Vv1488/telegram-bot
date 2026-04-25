const TelegramBot = require('node-telegram-bot-api');
const TOKEN = '8771287795:AAGxcYP2Z0X8yFp6G-E6DEIbbl4B7FKdq6o';
const АДМИН_ID = '407164745';
const выбранныйДень = {};
const выбранноеВремя = {};
const ожидаетИмя = {};
const ожидаетОтзыв = {};
const ожидаетРассылку = {};
const записи = {};
const всеКлиенты = new Set();
const всеЗаписи = [];
const bot = new TelegramBot(TOKEN, { polling: true });

function главноеМеню(chatId) {
    bot.sendMessage(chatId, 'Выбери что тебя интересует:', {
        reply_markup: {
            keyboard: [
                ['💅 Услуги и цены', '📅 Записаться'],
                ['💆 Уход за ногтями', '📍 Адрес'],
                ['📞 Контакты', '⭐ Оставить отзыв']
            ],
            resize_keyboard: true
        }
    });
}

function админМеню(chatId) {
    bot.sendMessage(chatId, 'Панель управления 👑', {
        reply_markup: {
            keyboard: [
                ['📋 Все записи', '📢 Рассылка']
            ],
            resize_keyboard: true
        }
    });
}

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    всеКлиенты.add(chatId);
    if (chatId.toString() === АДМИН_ID) {
        bot.sendMessage(chatId, 'Здарова, Ярослава! 👑');
        админМеню(chatId);
    } else {
        bot.sendMessage(chatId, 'Привет! 💅 Я бот Ярославы.');
        главноеМеню(chatId);
    }
});

bot.onText(/\/записи/, (msg) => {
    if (msg.chat.id.toString() !== АДМИН_ID) return;
    if (всеЗаписи.length === 0) {
        bot.sendMessage(АДМИН_ID, 'Записей пока нет.');
        return;
    }
    let список = '📋 Все записи:\n\n';
    всеЗаписи.forEach((з, i) => {
        список += (i+1) + '. ' + з.имя + ' — ' + з.день + ' в ' + з.время + '\n';
    });
    bot.sendMessage(АДМИН_ID, список);
});

bot.on('message', (msg) => {
    if (!msg.text || msg.text.startsWith('/')) return;
    const chatId = msg.chat.id;
    const текст = msg.text;
    всеКлиенты.add(chatId);

    if (chatId.toString() === АДМИН_ID) {
        if (текст === '📋 Все записи') {
            if (всеЗаписи.length === 0) {
                bot.sendMessage(АДМИН_ID, 'Записей пока нет.');
                return;
            }
            let список = '📋 Все записи:\n\n';
            всеЗаписи.forEach((з, i) => {
                список += (i+1) + '. ' + з.имя + ' — ' + з.день + ' в ' + з.время + '\n';
            });
            bot.sendMessage(АДМИН_ID, список);
            return;
        } else if (текст === '📢 Рассылка') {
            ожидаетРассылку[АДМИН_ID] = true;
            bot.sendMessage(АДМИН_ID, 'Напиши сообщение для рассылки всем клиентам:');
            return;
        } else if (ожидаетРассылку[АДМИН_ID]) {
            delete ожидаетРассылку[АДМИН_ID];
            let отправлено = 0;
            всеКлиенты.forEach(clientId => {
                if (clientId.toString() !== АДМИН_ID) {
                    bot.sendMessage(clientId, '📢 Сообщение от Ярославы:\n\n' + текст);
                    отправлено++;
                }
            });
            bot.sendMessage(АДМИН_ID, '✅ Рассылка отправлена ' + отправлено + ' клиентам!');
            return;
        }
        return;
    }

    if (ожидаетОтзыв[chatId]) {
        delete ожидаетОтзыв[chatId];
        bot.sendMessage(chatId, '⭐ Спасибо за отзыв! Ярослава обязательно прочитает.');
        bot.sendMessage(АДМИН_ID, '⭐ Новый отзыв:\n\n' + текст);
        главноеМеню(chatId);
        return;
    }

    if (ожидаетИмя[chatId]) {
        const имя = текст;
        delete ожидаетИмя[chatId];

        записи[chatId] = {
            имя: имя,
            день: выбранныйДень[chatId],
            время: выбранноеВремя[chatId]
        };

        всеЗаписи.push({
            имя: имя,
            день: выбранныйДень[chatId],
            время: выбранноеВремя[chatId],
            chatId: chatId
        });

        bot.sendMessage(chatId, '⏳ Твоя заявка отправлена! Ожидай подтверждения от Ярославы.');

        bot.sendMessage(АДМИН_ID,
            '📅 Новая запись!\n👤 Имя: ' + имя + '\n📅 День: ' + выбранныйДень[chatId] + '\n🕐 Время: ' + выбранноеВремя[chatId], {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '✅ Подтвердить', callback_data: 'confirm_' + chatId },
                        { text: '❌ Отменить', callback_data: 'cancel_' + chatId }
                    ]
                ]
            }
        });
        главноеМеню(chatId);
        return;
    }

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
        выбранныйДень[chatId] = текст;
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
        выбранноеВремя[chatId] = текст;
        ожидаетИмя[chatId] = true;
        bot.sendMessage(chatId, 'Как тебя зовут? Напиши своё имя:', {
            reply_markup: {
                remove_keyboard: true
            }
        });
    } else if (текст === '⭐ Оставить отзыв') {
        ожидаетОтзыв[chatId] = true;
        bot.sendMessage(chatId, 'Напиши свой отзыв — Ярослава обязательно прочитает! 😊', {
            reply_markup: {
                remove_keyboard: true
            }
        });
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

bot.on('callback_query', (query) => {
    const данные = query.data;
    const clientId = данные.split('_')[1];

    if (данные.startsWith('confirm_')) {
        const запись = записи[clientId];
        bot.sendMessage(clientId, '✅ Ярослава подтвердила твою запись!\n📅 ' + запись.день + ' в ' + запись.время + '\n📍 Адрес: ул. Телевизионная 23, Днепр');
        bot.answerCallbackQuery(query.id, { text: 'Запись подтверждена!' });
        bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
            chat_id: АДМИН_ID,
            message_id: query.message.message_id
        });
    } else if (данные.startsWith('cancel_')) {
        const запись = записи[clientId];
        bot.sendMessage(clientId, '❌ К сожалению Ярослава не может принять тебя в это время.\nПозвони для уточнения: +380 97 197 73 05');
        bot.answerCallbackQuery(query.id, { text: 'Запись отменена!' });
        bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
            chat_id: АДМИН_ID,
            message_id: query.message.message_id
        });
    }
});

console.log('Бот запущен!');
