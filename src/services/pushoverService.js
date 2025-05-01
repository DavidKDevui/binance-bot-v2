const dotenv = require('dotenv');
const Pushover = require('pushover-notifications');

const consoleTools = require('../utils/console');

// Configuration
dotenv.config();

const pushover = new Pushover({
    token: process.env.PUSHOVER_TOKEN,
    user: process.env.PUSHOVER_USER
});

const pushoverService = {
    sendNotification: async (title, message, priority = 0) => {
        try {
            const msg = { message: message, title: title, sound: 'cashregister', priority: priority };
            await pushover.send(msg);
            consoleTools.showInConsole('Notification Pushover envoyée avec succès', 'green');
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'envoi de la notification Pushover:', error);
            return false;
        } 
    },

    sendTradeNotification: async (type, amount, price) => {
        const title = `Trade ${type.toUpperCase()} - Binance Bot`;
        const message = `
        Type: ${type.toUpperCase()}
        Montant: ${amount} USDC
        Prix: ${price} USDC`;

        try {
            return await pushoverService.sendNotification(title, message);
        } catch (error) {
            console.error('Erreur lors de l\'envoi de la notification Pushover:', error);
            return false;
        }
    },

    sendErrorNotification: async (error) => {
        const title = '❌ ERREUR - Binance Bot';
        const message = `
            Une erreur est survenue:
            ${error.message}
            ${error.stack || ''}
                    `;

        try {
            return await pushoverService.sendNotification(title, message, 1);
        } catch (error) {
            console.error('Erreur lors de l\'envoi de la notification Pushover:', error);
            return false;
        }
    }
};

module.exports = pushoverService; 