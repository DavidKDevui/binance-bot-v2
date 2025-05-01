const Binance = require('binance-api-node').default;
const dotenv = require('dotenv');

dotenv.config();

const client = Binance({
    apiKey: process.env.BINANCE_API_KEY,
    apiSecret: process.env.BINANCE_API_SECRET
});

const walletService = {
    getWalletBalance: async () => {
        try {
            const accountInfo = await client.accountInfo();
            const balance = accountInfo.balances.filter(b => b.asset === 'ETH' || b.asset === 'USDC');
            return balance;
        } catch (error) {
            console.error('Erreur lors de la récupération du solde du portefeuille:', error);
            throw error;
        }
    }
}

module.exports = walletService;
