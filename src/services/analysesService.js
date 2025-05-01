const FEES_PERCENTAGE = 0.1;
const PROFIT_PERCENTAGE = 1 - (2 * FEES_PERCENTAGE);

const analysesService = {

    getPercentageDifference: (oldValue, newValue) => {
        const percentageDifference = ((newValue - oldValue) / oldValue) * 100;
        return parseFloat(percentageDifference.toFixed(2));
    },

    calculateDifference: (oldValue, newValue) => {
        const difference = newValue - oldValue;
        return parseFloat(difference.toFixed(2)) > 0 ? parseFloat(difference.toFixed(2)) : parseFloat(difference.toFixed(2)) * -1;
    },

    calculateFees: (amount) => {
        const fees = amount * (FEES_PERCENTAGE / 100);
        return parseFloat(fees.toFixed(2));
    },

    calculateProfit: (amount) => {
        const profit = amount * (PROFIT_PERCENTAGE / 100);
        return parseFloat(profit.toFixed(2));
    }
}


module.exports = analysesService;

