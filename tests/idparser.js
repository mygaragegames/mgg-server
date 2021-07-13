require('dotenv').config();
const chalk = require('chalk');
const { isGameIDValid, isCreatorIDValid } = require('../src/parsers');

console.clear();

// Games
console.log(chalk.cyan("[mgg-server] Testing GameID Parsers"));
let gameTests = [
    // valid tests
    { input: 'G-003-P0X-GVJ', result: true },
    { input: 'G-006-TR2-9JK', result: true },
    { input: 'G-001-BNV-GTD', result: true },
    { input: 'G-008-MDT-6GF', result: true },
    { input: 'G-006-1B4-9V0', result: true },
    // induce regex failure
    /// syntax
    { input: 'G-a0A-a0A-a0A', result: false },
    { input: '000-000-000', result: false },
    { input: 'GG-000-000-000', result: false },
    { input: 'G000000000', result: false },
    { input: 'G-0-0-0', result: false },
    { input: 'A-000-000-000', result: false },
    /// illegal chars
    { input: 'G-AAA-AAA-AAA', result: false },
    { input: 'G-Z00-000-000', result: false },
    { input: 'G-000-0Z0-Z00', result: false },
    { input: 'G-000-000-00Z', result: false },
    { input: 'G-000-000-00A', result: false },
    { input: 'G-000-000-00E', result: false },
    { input: 'G-000-000-00I', result: false },
    { input: 'G-000-000-00O', result: false },
    { input: 'G-000-000-00U', result: false },
    { input: 'G-000-000-00Q', result: false },
    { input: 'G-000-000-00S', result: false },
    // induce checksum failure
    { input: 'G-000-000-000', result: false },
    { input: 'G-B21-DRV-8C0', result: false },
    { input: 'G-FDV-YF2-D5T', result: false },
    { input: 'G-RDW-M64-N9W', result: false },
    { input: 'G-V4V-VN3-B5R', result: false },
    { input: 'G-BLL-6YV-DVC', result: false },
    { input: 'G-718-74R-228', result: false },
];

gameTests.forEach(test => {
    let testResult = isGameIDValid(test.input);

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
    let testResult = isCreatorIDValid(test.input);

    if(testResult == test.result) {
        console.log(chalk.green(`[mgg-server] (IDParserTest) --> ${test.input} = ${testResult} (Expecting: ${test.result})`));
    } else {
        console.log(chalk.red(`[mgg-server] (IDParserTest) --> ${test.input} = ${testResult} (Expecting: ${test.result})`));
    }
});

console.log("");
