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

function головнеМеню(chatId) {
    bot.sendMessage(chatId, 'Обери що тебе цікавить:', {
        reply_markup: {
            keyboard: [
                ['💅 Послуги та ціни', '📅 Записатись'],
                ['💆 Догляд за нігтями', '📍 Адреса'],
                ['📞 Контакти', '⭐ Залишити відгук']
            ],
            resize_keyboard: true
        }
    });
}

function адмінМеню(chatId) {
    bot.sendMessage(chatId, 'Панель управління 👑', {
        reply_markup: {
            keyboard: [
                ['📋 Всі записи', '📢 Розсилка']
            ],
            resize_keyboard: true
        }
    });
}

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    всеКлиенты.add(chatId);
    if (chatId.toString() === АДМИН_ID) {
        bot.sendMessage(chatId, 'Привіт, Ярослава! 👑');
        адмінМеню(chatId);
    } else {
        bot.sendMessage(chatId, 'Привіт! 💅 Я бот Ярослави.');
        головнеМеню(chatId);
    }
});

bot.onText(/\/записи/, (msg) => {
    if (msg.chat.id.toString() !== АДМИН_ID) return;
    if (всеЗаписи.length === 0) {
        bot.sendMessage(АДМИН_ID, 'Записів поки немає.');
        return;
    }
    let список = '📋 Всі записи:\n\n';
    всеЗаписи.forEach((з, i) => {
        список += (i+1) + '. ' + з.імя + ' — ' + з.день + ' о ' + з.час + '\n';
    });
    bot.sendMessage(АДМИН_ID, список);
});

bot.on('message', (msg) => {
    if (!msg.text || msg.text.startsWith('/')) return;
    const chatId = msg.chat.id;
    const текст = msg.text;
    всеКлиенты.add(chatId);

    if (chatId.toString() === АДМИН_ID) {
        if (текст === '📋 Всі записи') {
            if (всеЗаписи.length === 0) {
                bot.sendMessage(АДМИН_ID, 'Записів поки немає.');
                return;
            }
            let список = '📋 Всі записи:\n\n';
            всеЗаписи.forEach((з, i) => {
                список += (i+1) + '. ' + з.імя + ' — ' + з.день + ' о ' + з.час + '\n';
            });
            bot.sendMessage(АДМИН_ID, список);
            return;
        } else if (текст === '📢 Розсилка') {
            ожидаетРассылку[АДМИН_ID] = true;
            bot.sendMessage(АДМИН_ID, 'Напиши повідомлення для розсилки всім клієнтам:');
            return;
        } else if (ожидаетРассылку[АДМИН_ID]) {
            delete ожидаетРассылку[АДМИН_ID];
            let відправлено = 0;
            всеКлиенты.forEach(clientId => {
                if (clientId.toString() !== АДМИН_ID) {
                    bot.sendMessage(clientId, '📢 Повідомлення від Ярослави:\n\n' + текст);
                    відправлено++;
                }
            });
            bot.sendMessage(АДМИН_ID, '✅ Розсилку відправлено ' + відправлено + ' клієнтам!');
            return;
        }
        return;
    }

    if (ожидаетОтзыв[chatId]) {
        delete ожидаетОтзыв[chatId];
        bot.sendMessage(chatId, '⭐ Дякуємо за відгук! Ярослава обов\'язково прочитає.');
        bot.sendMessage(АДМИН_ID, '⭐ Новий відгук:\n\n' + текст);
        головнеМеню(chatId);
        return;
    }

    if (ожидаетИмя[chatId]) {
        const імя = текст;
        delete ожидаетИмя[chatId];

        записи[chatId] = {
            імя: імя,
            день: выбранныйДень[chatId],
            час: выбранноеВремя[chatId]
        };

        всеЗаписи.push({
            імя: імя,
            день: выбранныйДень[chatId],
            час: выбранноеВремя[chatId],
            chatId: chatId
        });

        bot.sendMessage(chatId, '⏳ Твою заявку відправлено! Очікуй підтвердження від Ярослави.');

        bot.sendMessage(АДМИН_ID,
            '📅 Новий запис!\n👤 Ім\'я: ' + імя + '\n📅 День: ' + выбранныйДень[chatId] + '\n🕐 Час: ' + выбранноеВремя[chatId], {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '✅ Підтвердити', callback_data: 'confirm_' + chatId },
                        { text: '❌ Скасувати', callback_data: 'cancel_' + chatId }
                    ]
                ]
            }
        });
        головнеМеню(chatId);
        return;
    }

    if (текст === '💅 Послуги та ціни') {
        bot.sendMessage(chatId, '💅 Послуги та ціни:\n\n• Манікюр — 300 грн\n• Манікюр + покриття — 500 грн\n• Педикюр — 400 грн\n• Зняття покриття — 100 грн');
    } else if (текст === '📅 Записатись') {
        bot.sendMessage(chatId, 'Обери зручний день:', {
            reply_markup: {
                keyboard: [
                    ['Понеділок', 'Вівторок', 'Середа'],
                    ['Четвер', 'П\'ятниця', 'Субота'],
                    ['🔙 Головне меню']
                ],
                resize_keyboard: true
            }
        });
    } else if (['Понеділок','Вівторок','Середа','Четвер','П\'ятниця','Субота'].includes(текст)) {
        выбранныйДень[chatId] = текст;
        bot.sendMessage(chatId, 'Обери зручний час:', {
            reply_markup: {
                keyboard: [
                    ['10:00', '12:00', '14:00'],
                    ['16:00', '18:00'],
                    ['🔙 Головне меню']
                ],
                resize_keyboard: true
            }
        });
    } else if (['10:00','12:00','14:00','16:00','18:00'].includes(текст)) {
        выбранноеВремя[chatId] = текст;
        ожидаетИмя[chatId] = true;
        bot.sendMessage(chatId, 'Як тебе звати? Напиши своє ім\'я:', {
            reply_markup: {
                remove_keyboard: true
            }
        });
    } else if (текст === '⭐ Залишити відгук') {
        ожидаетОтзыв[chatId] = true;
        bot.sendMessage(chatId, 'Напиши свій відгук — Ярослава обов\'язково прочитає! 😊', {
            reply_markup: {
                remove_keyboard: true
            }
        });
    } else if (текст === '💆 Догляд за нігтями') {
        bot.sendMessage(chatId, '💆 Поради по догляду:\n\n• Не мочити нігті 2 години після покриття\n• Використовуй олію для кутикули щодня\n• Не відкривай банки нігтями 😄\n• Носи рукавички при прибиранні');
    } else if (текст === '📍 Адреса') {
        bot.sendMessage(chatId, '📍 Адреса: вул. Телевізійна 23, Дніпро\n🕐 Години роботи: Пн-Сб 10:00 - 20:00');
    } else if (текст === '📞 Контакти') {
        bot.sendMessage(chatId, '📞 Телефон: +380 97 197 73 05\n📸 Інстаграм: @__gurova.nail__');
    } else if (текст === '🔙 Головне меню') {
        головнеМеню(chatId);
    }
});

bot.on('callback_query', (query) => {
    const дані = query.data;
    const clientId = дані.split('_')[1];

    if (дані.startsWith('confirm_')) {
        const запис = записи[clientId];
        bot.sendMessage(clientId, '✅ Ярослава підтвердила твій запис!\n📅 ' + запис.день + ' о ' + запис.час + '\n📍 Адреса: вул. Телевізійна 23, Дніпро');
        bot.answerCallbackQuery(query.id, { text: 'Запис підтверджено!' });
        bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
            chat_id: АДМИН_ID,
            message_id: query.message.message_id
        });
    } else if (дані.startsWith('cancel_')) {
        bot.sendMessage(clientId, '❌ На жаль Ярослава не може прийняти тебе в цей час.\nПозвони для уточнення: +380 97 197 73 05');
        bot.answerCallbackQuery(query.id, { text: 'Запис скасовано!' });
        bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
            chat_id: АДМИН_ID,
            message_id: query.message.message_id
        });
    }
});

console.log('Бот запущено!');
