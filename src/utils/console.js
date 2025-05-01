const consoleTools = {

    showInConsole: (message, color) => {

    if (color === "green") {
        console.log(`\x1b[32m${message}\x1b[0m`);
    } else if (color === "red") {
        console.log(`\x1b[31m${message}\x1b[0m`);
    } else if (color === "yellow") {
        console.log(`\x1b[33m${message}\x1b[0m`);
    } else if (color === "blue") {
        console.log(`\x1b[34m${message}\x1b[0m`);
    } else if (color === "magenta") {
        console.log(`\x1b[35m${message}\x1b[0m`);
    } else if (color === "cyan") {
        console.log(`\x1b[36m${message}\x1b[0m`);
    } else if (color === "white") {
        console.log(`\x1b[37m${message}\x1b[0m`);
    } else if (color === "gray") {
        console.log(`\x1b[90m${message}\x1b[0m`);
    } else if (color === "black") {
        console.log(`\x1b[30m${message}\x1b[0m`);
    } else if (color === "bgGreen") {
        console.log(`\x1b[42m${message}\x1b[0m`);
    } else if (color === "bgRed") {
        console.log(`\x1b[41m${message}\x1b[0m`);
    } else if (color === "bgYellow") {
        console.log(`\x1b[43m${message}\x1b[0m`);
    } else if (color === "bgBlue") {
        console.log(`\x1b[44m${message}\x1b[0m`);
    } else if (color === "bgMagenta") {
        console.log(`\x1b[45m${message}\x1b[0m`);
    } else if (color === "bgCyan") {
        console.log(`\x1b[46m${message}\x1b[0m`);
    } else if (color === "bgWhite") {
        console.log(`\x1b[47m${message}\x1b[0m`);
    } else if (color === "bgGray") {
        console.log(`\x1b[100m${message}\x1b[0m`);
    } else if (color === "bgBlack") {
        console.log(`\x1b[40m${message}\x1b[0m`);
    } else if (color === "bold") {
        console.log(`\x1b[1m${message}\x1b[0m`);
    } else if (color === "dim") {
        console.log(`\x1b[2m${message}\x1b[0m`);
    } else if (color === "italic") {
        console.log(`\x1b[3m${message}\x1b[0m`);
    } else {
            console.log(message);
        }
    }
}

module.exports = consoleTools;


