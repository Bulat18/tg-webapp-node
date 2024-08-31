const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');



const token = '7443518514:AAGqdsLdXK5E37qGCMZWLVywsuiEspy2fpk';
const  WebAppUrl = 'https://webappmarket.netlify.app';
const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());


bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  if (text === '/start'){
    await bot.sendMessage(chatId, "Сейчас появится кнопка, заполни форму", {
        reply_markup :{
            keyboard:[
                [{text:"Keyboard Button", web_app:{url:WebAppUrl}}
            ]]
        }
    })
    await bot.sendMessage(chatId, 'Вот кнопка для открытия магазина',{
        reply_markup :{
            inline_keyboard :[
                [{text: "Заполнить данные", web_app:{url : WebAppUrl +'/form'}}]
            ]
        }
    })
  }
  if (msg?.web_app_data?.data) {
    console.log('Получены данные от Web App:', msg.web_app_data.data);
    await bot.sendMessage(chatId, 'Спасибо за обратную связь!');

    try {
        const data = JSON.parse(msg.web_app_data.data);

        // Отправка данных обратно пользователю
        await bot.sendMessage(chatId, `Полученные данные:\nСтрана: ${data.country}\nУлица: ${data.street}\nТип: ${data.subject}`);

        setTimeout(async () => {
            await bot.sendMessage(chatId, 'Всю информацию вы получите в этом чате');
        }, 3000);
    } catch (e) {
        // Логирование ошибки
        console.error('Ошибка при обработке данных Web App:', e);

        // Сообщение пользователю об ошибке
        await bot.sendMessage(chatId, 'Произошла ошибка при обработке данных. Попробуйте еще раз.');
    }
}
});
app.post('/web-data', async (req, res) => {
    const {queryId, products = [], totalPrice} = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {
                message_text: ` Поздравляю с покупкой, вы приобрели товар на сумму ${totalPrice}, ${products.map(item => item.title).join(', ')}`
            }
        })
        return res.status(200).json({});
    } catch (e) {
        return res.status(500).json({})
    }
})
const PORT = 8000;


app.listen(PORT, () => console.log('server started on PORT' + PORT));