// Dépendances
const fs = require("fs");
const dotenv = require("dotenv");
const Binance = require('binance-api-node').default;
const dateTools = require("../utils/date.js");  
const pushoverService = require("./pushoverService.js");
const assetsService = require("./assetsService.js");
const consoleTools = require("../utils/console.js");

// Configuration
dotenv.config();

const client = Binance({
    apiKey: process.env.BINANCE_API_KEY,
    apiSecret: process.env.BINANCE_API_SECRET
});

const LOT_SIZE = {
    minQty: 0.001,
    maxQty: 1000,
    stepSize: 0.001,
    minNotional: 10
};

// Fonction pour formater la quantité selon les règles de lot
const formatQuantity = (quantity, price) => {

    quantity = parseFloat(quantity);
    quantity = quantity.toFixed(6);
    quantity = Math.max(LOT_SIZE.minQty, Math.min(LOT_SIZE.maxQty, quantity));
    quantity = Math.floor(quantity / LOT_SIZE.stepSize) * LOT_SIZE.stepSize;
    const notional = quantity * price;
    if (notional < LOT_SIZE.minNotional) {
        quantity = (LOT_SIZE.minNotional / price).toFixed(6);
        quantity = Math.max(LOT_SIZE.minQty, Math.min(LOT_SIZE.maxQty, quantity));
        quantity = Math.floor(quantity / LOT_SIZE.stepSize) * LOT_SIZE.stepSize;
    }
    return quantity.toFixed(6);
};

const operationsService = {
    initializeFile: () => {
        if (!fs.existsSync("data/operations.json")){
            fs.writeFileSync("data/operations.json", JSON.stringify({ operations: [] }, null, 2));
        }
    },


    buy: async () => {

        // Récupérer le solde du portefeuille
        const accountInfo = await client.accountInfo();
        const ethPrice = await assetsService.getAssetPrice('ETHUSDC');
        const usdcBalance = accountInfo.balances.find(b => b.asset === 'USDC');

        // Calculer la quantité d'ETH à acheter
        let percent = 1;
        let ethQuantity = parseFloat(formatQuantity((usdcBalance.free / ethPrice) * percent, ethPrice));
        let isOrderEnded = false;
         

        // Boucle de réduction en cas d'erreur
        while (ethQuantity >= LOT_SIZE.minQty && !isOrderEnded) {

            try {
                // Créer l'ordre d'achat
                const order = await client.order({  symbol: 'ETHUSDC',  side: 'BUY',  type: 'MARKET',  quantity: ethQuantity });
                const orderStatus = await client.getOrder({ symbol: 'ETHUSDC', orderId: order.orderId });

                if (orderStatus.status === 'FILLED') {
                    operationsService.writeOperation({ type: "buy", date: dateTools.getCurrentDate(), ethPrice: ethPrice, amount: parseFloat(usdcBalance.free)});
                    isOrderEnded = true;
                    await pushoverService.sendTradeNotification('buy', parseFloat(usdcBalance.free), ethPrice); 
                    console.log(orderStatus);
                    consoleTools.showInConsole("Achat effectué avec succès !", "green");
                    return orderStatus;
                } else {
                    consoleTools.showInConsole("[Sloat 1] Erreur lors de l'achat", "red");
                    await pushoverService.sendErrorNotification("Erreur lors de l'achat (sloat1)");
                    isOrderEnded = true;
                    throw new Error("Erreur lors de l'achat (sloat1)");
                }

            } catch (error) {
                // Erreur du solde insuffisant
                if (error.code === -2010) {
                    if (percent <= 0.05){
                        return new Error("Solde insuffisant meme avec le coefficient le plus bas");
                    }
                    consoleTools.showInConsole("[-2010] Solde insuffisant, réduction du coefficient...", "red");
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    percent = percent - 0.05;
                    ethQuantity = parseFloat(formatQuantity((usdcBalance.free / ethPrice) * percent, ethPrice));
                    consoleTools.showInConsole(`Nouvelle tentative avec une quantité réduite: => ${ethQuantity}`, "yellow");
                    continue;
                } 

                // Erreur de taille de lot
                else if (error.code === -1013) {
                    isOrderEnded = true;
                    return new Error("Erreur lors de l'achat (-1013)");
                } 

                // Erreur inconnue
                else {
                    isOrderEnded = true;
                    console.log("error inconnue", error);
                    consoleTools.showInConsole(error, "red");
                    return error;
                }
            }
        }
        
        return true; 
    },


    sell: async () => {
        try {

            // Récupérer le solde du portefeuille
            const accountInfo = await client.accountInfo();
            const ethPrice = await assetsService.getAssetPrice('ETHUSDC');
            const ethBalance = accountInfo.balances.find(b => b.asset === 'ETH');
 
          
            // Utiliser le solde disponible (free) pour la vente
            let percent = 1;
            let ethQuantity = formatQuantity(parseFloat(ethBalance.free * percent), ethPrice);
            let isOrderEnded = false;
 

            // Boucle de réduction en cas d'erreur
            while (parseFloat(ethQuantity) >= LOT_SIZE.minQty && !isOrderEnded) {

                try {
                    // Créer l'ordre de vente pour convertir ETH en USDC
                    const order = await client.order({  symbol: 'ETHUSDC',  side: 'SELL', type: 'MARKET', quantity: ethQuantity });
                    const orderStatus = await client.getOrder({ symbol: 'ETHUSDC', orderId: order.orderId });

                    if (orderStatus.status === 'FILLED') {
                        operationsService.writeOperation({ type: "sell", date: dateTools.getCurrentDate(), ethPrice: ethPrice, amount: parseFloat(ethQuantity) * ethPrice });
                        isOrderEnded = true;
                        await pushoverService.sendTradeNotification('sell', parseFloat(ethQuantity) * ethPrice, ethPrice);
                        console.log(orderStatus);
                        consoleTools.showInConsole("Vente effectuée avec succès !", "green");
                        return orderStatus;
                    } else {
                        consoleTools.showInConsole("[Sloat 2] Erreur lors de la vente", "red");
                        await pushoverService.sendErrorNotification("Erreur lors de la vente (sloat2)");
                        isOrderEnded = true;
                        throw new Error("Erreur lors de la vente (sloat2)");
                    }
                } catch (error) {
                    if (error.code === -2010) {    //INSUFFICIENT_FUNDS
                        consoleTools.showInConsole("Solde insuffisant, réduction du coefficient...", "red");
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        percent = percent - 0.05;
                        ethQuantity = formatQuantity(parseFloat(ethBalance.free * percent), ethPrice);
                        consoleTools.showInConsole(`Nouvelle tentative avec une quantité réduite: => ${ethQuantity}`, "yellow");
                        continue;
                    } else if (error.code === -1013){   //LOT_SIZE
                        isOrderEnded = true;
                        return new Error("Erreur lors de la vente (-1013)");
                    } else {
                        isOrderEnded = true; 
                        console.log(error);
                        return error;
                    }
                }
            }
            return true;
        } catch (error) {
            console.log(error);
            console.error("Erreur lors de la vente:", error);
            await pushoverService.sendErrorNotification(error);
            return false;
        }
    },


    stopLoss: async () => {
        try {

            // Récupérer le solde du portefeuille
            const accountInfo = await client.accountInfo();
            const ethPrice = await assetsService.getAssetPrice('ETHUSDC');
            const ethBalance = accountInfo.balances.find(b => b.asset === 'ETH');
 
          
            // Utiliser le solde disponible (free) pour la vente
            let percent = 1;
            let ethQuantity = formatQuantity(parseFloat(ethBalance.free * percent), ethPrice);
            let isOrderEnded = false;
 

            // Boucle de réduction en cas d'erreur
            while (parseFloat(ethQuantity) >= LOT_SIZE.minQty && !isOrderEnded) {

                try {
                    // Créer l'ordre de vente pour convertir ETH en USDC
                    const order = await client.order({  symbol: 'ETHUSDC',  side: 'SELL', type: 'MARKET', quantity: ethQuantity });
                    const orderStatus = await client.getOrder({ symbol: 'ETHUSDC', orderId: order.orderId });

                    if (orderStatus.status === 'FILLED') {
                        operationsService.writeOperation({ type: "stop_loss", date: dateTools.getCurrentDate(), ethPrice: ethPrice, amount: parseFloat(ethQuantity) * ethPrice });
                        await pushoverService.sendTradeNotification('stop_loss', parseFloat(ethQuantity) * ethPrice, ethPrice);
                        isOrderEnded = true;
                        console.log(orderStatus);
                        consoleTools.showInConsole("Stop loss effectué avec succès !", "green");
                        return orderStatus;
                    } else {
                        consoleTools.showInConsole("[Sloat 3] Erreur lors du stop loss", "red");
                        await pushoverService.sendErrorNotification("Erreur lors du stop loss (sloat3)");
                        isOrderEnded = true;
                        throw new Error("Erreur lors du stop loss (sloat3)");
                    }
                } catch (error) {
                    if (error.code === -2010) {    //INSUFFICIENT_FUNDS
                        consoleTools.showInConsole("Solde insuffisant, réduction du coefficient...", "red");
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        percent = percent - 0.05;
                        ethQuantity = formatQuantity(parseFloat(ethBalance.free * percent), ethPrice);
                        consoleTools.showInConsole(`Nouvelle tentative avec une quantité réduite: => ${ethQuantity}`, "yellow");
                        continue;
                    } else if (error.code === -1013){   //LOT_SIZE
                        isOrderEnded = true;
                        return new Error("Erreur lors du stop loss (-1013)");
                    } else {
                        isOrderEnded = true; 
                        console.log(error);
                        return error;
                    }
                }
            }
            return true;
        } catch (error) {
            console.log(error);
            console.error("Erreur lors de la vente:", error);
            await pushoverService.sendErrorNotification(error);
            return false;
        }
    },





    getLastOperation: async (ethBalanceUsd, usdcBalanceUsd) => {

        if  (ethBalanceUsd > usdcBalanceUsd){
            return { type: "buy", date: null, ethPrice: null };
        } else {
            return { type: "sell", date: null, ethPrice: null };
        }

    },

    writeOperation: (operation) => {
        const operationsHistory = JSON.parse(fs.readFileSync("./data/operations.json", "utf8"));
        fs.writeFileSync("./data/operations.json", JSON.stringify({ operations: [...operationsHistory.operations, operation] }, null, 2));
    }
}

module.exports = operationsService;