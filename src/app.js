// Services
const assetsService = require("./services/assetsService.js");
const walletService = require("./services/walletService.js");
const analysesService = require("./services/analysesService.js");
const operationsService = require("./services/operationsService.js");

// Utils
const dateTools = require("./utils/date.js");
const consoleTools = require("./utils/console.js");




async function main() {

    let lastOperation = null;

    let startValue = parseFloat(process.env.START_VALUE);
    let takeProfit = parseFloat(startValue * (1 + (process.env.TAKE_PROFIT / 100)));
    let stopLoss = parseFloat(startValue * (1 - (process.env.STOP_LOSS / 100)));


    operationsService.initializeFile();

   
    while (true) {

        //Récupérer le prix actuel de l'ETH et du USDC
        const ethPrice = await assetsService.getAssetPrice("ETHUSDT");
        const usdcPrice = await assetsService.getAssetPrice("USDCUSDT");

        //Récupérer le solde du portefeuille
        const walletBalance = await walletService.getWalletBalance();

        //Récupérer la tendance de l'ETH des 24 dernières heures
        const ethHistory = await assetsService.getAssetHistory("ETHUSDT", "15m", 4);
        const ethVariations = await assetsService.getAssetVariations("ETHUSDT");



        //Vérifier si les données ont été récupérées correctement
        if (ethPrice instanceof Error){
            consoleTools.showInConsole(`Erreur lors de la récupération du prix de l'ETH: ${ethPrice.message}`, "red");
            continue;
        }
        if (usdcPrice instanceof Error){
            consoleTools.showInConsole(`Erreur lors de la récupération du prix du USDC: ${usdcPrice.message}`, "red");
            continue;
        }
        if (walletBalance instanceof Error){
            consoleTools.showInConsole(`Erreur lors de la récupération du solde du portefeuille: ${walletBalance.message}`, "red");
            continue;
        }   
        if (ethHistory instanceof Error){
            consoleTools.showInConsole(`Erreur lors de la récupération de l'historique de l'ETH: ${ethHistory.message}`, "red");
            continue;
        }
        if (ethVariations instanceof Error){
            consoleTools.showInConsole(`Erreur lors de la récupération des variations de l'ETH: ${ethVariations.message}`, "red");
            continue;
        }
        


        //Calculer le solde en unité
        const ethBalanceUnit = parseFloat(walletBalance.find(balance => balance.asset === "ETH")?.free || 0);
        const usdcBalanceUnit = parseFloat(walletBalance.find(balance => balance.asset === "USDC")?.free || 0);

        //Calculer le solde en USD
        const ethBalance = parseFloat((ethBalanceUnit * ethPrice).toFixed(2));
        const usdcBalance = parseFloat((usdcBalanceUnit * usdcPrice).toFixed(2));


        //Récupérer les anciennes valeurs de l'ETH
        const ethPrice15minAgo = parseFloat(ethHistory[ethHistory.length - 1].open);
        const ethPrice30minAgo = parseFloat(ethHistory[ethHistory.length - 2].open);
        const ethPrice45minAgo = parseFloat(ethHistory[ethHistory.length - 3].open);
        const ethPrice1hAgo = parseFloat(ethHistory[ethHistory.length - 4].open);

        //Calculer la variation en pourcentage
        const ethVariation15min = analysesService.getPercentageDifference(ethPrice15minAgo, ethPrice);

        //Récupérer la dernière opération
        lastOperation = await operationsService.getLastOperation(ethBalance, usdcBalance);


        //Afficher la date et les prix
        consoleTools.showInConsole("\n", "white");
        consoleTools.showInConsole("------------------------------------------------", "black");
        consoleTools.showInConsole(dateTools.getCurrentDate(), "italic");
        consoleTools.showInConsole("\n", "white");

        consoleTools.showInConsole("💠 ETH", "cyan");
        console.log("Valeur actuelle:", ethPrice);
        console.log("Intervalle de variation:", parseFloat(ethVariations.highPrice), "|", parseFloat(ethVariations.lowPrice));
        console.log("Dernière heure:", ethPrice1hAgo, ">", ethPrice45minAgo, ">", ethPrice30minAgo, ">", ethPrice15minAgo);
        consoleTools.showInConsole(ethVariation15min < 0 ? `↓${ethVariation15min}%` : `↑${ethVariation15min}%`, ethVariation15min < 0 ? "red" : "green");
        console.log("\n");

        
        consoleTools.showInConsole("💰 Wallet Balance", "cyan");
        console.log("Valeure totale:", ethBalance + usdcBalance);
        console.log("ETH:", ethBalance, "|", ethBalanceUnit);
        console.log("USDC:", usdcBalance, "|", usdcBalanceUnit);
        console.log("\n");


        consoleTools.showInConsole("💸 Opérations", "cyan");
        
        if (lastOperation.type === "buy"){
            console.log("Prochaine vente à:", takeProfit, "| dans", analysesService.calculateDifference(ethPrice, takeProfit));
            console.log("Stop loss à:", stopLoss, "| dans", analysesService.calculateDifference(ethPrice, stopLoss));
        } else if (lastOperation.type === "sell"){
            console.log("Prochain achat à:", startValue, "| dans", analysesService.calculateDifference(ethPrice, startValue));
            console.log("Stop loss à:", stopLoss, "| dans", analysesService.calculateDifference(ethPrice, stopLoss));
        } else if (lastOperation.type === "stop_loss"){
            console.log("Prochain achat à:", startValue, "| dans", analysesService.calculateDifference(ethPrice, startValue));
        }
        console.log("Dernière opération:", lastOperation.type === "buy" ? "Achat" : lastOperation.type === "sell" ? "Vente" : lastOperation.type === "stop_loss" ? "Stop loss" : "Aucune opération", `${lastOperation.ethPrice ? "à " + parseFloat(lastOperation.ethPrice).toFixed(2) : ""}`);
        
        console.log("");
        console.log("Frais de transaction:", analysesService.calculateFees(ethBalance + usdcBalance), "USD");
        console.log("Gain par transaction:", analysesService.calculateProfit(ethBalance + usdcBalance), "USD");
        
        console.log("\n");




        //Gestion du stop loss
        if (lastOperation.type === "buy" && ethPrice <= stopLoss){
            consoleTools.showInConsole("Valeur de stop loss atteinte, vente en cours...",  "yellow");
            const order = await operationsService.stopLoss();
            if (order instanceof Error){
                consoleTools.showInConsole(`Erreur lors du stop loss: ${respone.message}`, "red");
            } else {
                process.exit(0);
            }
        }


        //Gestion de la vente
        if (lastOperation.type === "buy" && ethPrice >= takeProfit){ 
            consoleTools.showInConsole("Valeur de vente atteinte, vente en cours...",  "yellow");
            const respone = await operationsService.sell();
            if (respone instanceof Error){
                consoleTools.showInConsole("Erreur lors de la vente", "red");
            }
        }


        //Gestion de l'achat
        if (lastOperation.type === "sell" && ethPrice <= startValue){
            consoleTools.showInConsole("Valeur d'achat atteinte, achat en cours...",  "yellow");
            const order = await operationsService.buy();
            if (order instanceof Error){
                consoleTools.showInConsole(`Erreur lors de l'achat: ${order.message}`, "red");
            }
        }


        await new Promise(resolve => setTimeout(resolve, 8000));
    }
}

main();