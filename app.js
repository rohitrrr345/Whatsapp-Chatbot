require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const twilio = require('twilio');
const User = require('./models/User');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

mongoose.connect(process.env.MONGO_URI)

    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


let userSteps = {};


app.post('/whatsapp', (req, res) => {
    console.log(req.body)
    const incomingMessage = req.body.Body.trim().toLowerCase();
    const from = req.body.From;
    console.log(from);
    const userNumber = from.replace('whatsapp:', '');

    if (!userSteps[userNumber]) {
        userSteps[userNumber] = { step: 1, data: {} };
    }

    let userStep = userSteps[userNumber].step;
    let replyMessage = '';

    switch (userStep) {
        case 1:
            replyMessage = 'Welcome! Please provide your username:';
            userSteps[userNumber].step = 2;
            break;
        case 2:
            userSteps[userNumber].data.username = incomingMessage;
            replyMessage = 'Thanks! Now, provide your address:';
            userSteps[userNumber].step = 3;
            break;
        case 3:
            userSteps[userNumber].data.address = incomingMessage;
            replyMessage = 'Great! Now, provide your phone number:';
            userSteps[userNumber].step = 4;
            break;
        case 4:
            userSteps[userNumber].data.phoneNumber = incomingMessage; 
            replyMessage = 'What is your gender?';
            userSteps[userNumber].step = 5;
            break;
        case 5:
            userSteps[userNumber].data.gender = incomingMessage;
            replyMessage = 'What is your age?';
            userSteps[userNumber].step = 6;
            break;
        case 6:
            userSteps[userNumber].data.age = incomingMessage;
            replyMessage = 'What is your occupation?';
            userSteps[userNumber].step = 7;
            break;
        case 7:
            userSteps[userNumber].data.occupation = incomingMessage;

            console.log(userSteps);
            const newUser = new User({
                username: userSteps[userNumber].data.username,
                address: userSteps[userNumber].data.address,
                phoneNumber: userSteps[userNumber].data.phoneNumber,
                gender: userSteps[userNumber].data.gender,
                age: userSteps[userNumber].data.age,
                occupation: userSteps[userNumber].data.occupation,
            });

            newUser.save()
                .then(() => console.log('User data saved!'))
                .catch(err => console.log(err));

            replyMessage = 'Thank you! Your information has been saved. We will contact you after this work further processing';
            userSteps[userNumber].step = 1;
            break;
        default:
            replyMessage = 'Sorry, I did not understand that.';
            break;
    }

    client.messages.create({
        body: replyMessage,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: from,
    }).then(message => console.log(`Message sent: ${message.sid}`))
      .catch(err => console.error(err));

    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
