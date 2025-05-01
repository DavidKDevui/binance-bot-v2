const Binance = require('binance-api-node').default;
const dotenv = require('dotenv');

dotenv.config();

const client = Binance({
    apiKey: process.env.BINANCE_API_KEY,
    apiSecret: process.env.BINANCE_API_SECRET
});

const assetsService = {
    getAssetPrice: async (asset) => {
        try {
            const ticker = await client.prices({ symbol: asset });
            return parseFloat(ticker[asset]);
        } catch (error) {
            console.error(`Erreur lors de la récupération du prix pour ${asset}:`, error);
            throw error;
        }
    },

    getAssetHistory: async (asset, period, limit) => {
        try {
            const history = await client.candles({ symbol: asset, interval: period, limit: limit });
            return history;
        } catch (error) {
            console.error(`Erreur lors de la récupération de l'historique pour ${asset}:`, error);
            throw error;
        }
    },


    getAssetVariations: async (asset) => {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${asset}`)
        const data = await response.json()
        return data
    }
}

module.exports = assetsService;
