require('dotenv').config();
const chalk = require('chalk');
const { checkGameID, checkCreatorID } = require('../src/parsers');

console.clear();

// Games
console.log(chalk.cyan("[mgg-server] Testing GameID Parsers"));
let gameTests = [
    { input: 'G-000-000-000', result: true },
    { input: 'G-AAA-AAA-AAA', result: true },
    { input: 'G-a0A-a0A-a0A', result: true },
    { input: '000-000-000', result: false },
    { input: 'GG-000-000-000', result: false },
    { input: 'G000000000', result: false },
    { input: 'G-0-0-0', result: false },
    { input: 'A-000-000-000', result: false }
];

gameTests.forEach(test => {
    let testResult = checkGameID(test.input);

    if(testResult == test.result) {
        console.log(chalk.green(`[mgg-server] (IDParserTest) --> ${test.input} = ${testResult} (Expecting: ${test.result})`));
    } else {
        console.log(chalk.red(`[mgg-server] (IDParserTest) --> ${test.input} = ${testResult} (Expecting: ${test.result})`));
    }
});

console.log("");

// Creators
console.log(chalk.cyan("[mgg-server] Testing CreatorID Parsers"));
let creatorTests = [
    { input: 'P-000-000-000', result: true },
    { input: 'P-AAA-AAA-AAA', result: true },
    { input: 'P-a0A-a0A-a0A', result: true },
    { input: '000-000-000', result: false },
    { input: 'PP-000-000-000', result: false },
    { input: 'P000000000', result: false },
    { input: 'P-0-0-0', result: false },
    { input: 'A-000-000-000', result: false }
];

creatorTests.forEach(test => {
    let testResult = checkCreatorID(test.input);

    if(testResult == test.result) {
        console.log(chalk.green(`[mgg-server] (IDParserTest) --> ${test.input} = ${testResult} (Expecting: ${test.result})`));
    } else {
        console.log(chalk.red(`[mgg-server] (IDParserTest) --> ${test.input} = ${testResult} (Expecting: ${test.result})`));
    }
});

console.log("");