require('dotenv').config();
const chalk = require('chalk');
const { makeUsernameValid } = require('../src/parsers');

console.clear();

// Testing bad Usernames
console.log(chalk.cyan("[mgg-server] Testing Username Parser"));
let nameTests = [
    { input: 'Test', result: 'Test' },
    { input: 'T E S T', result: 'TEST' },
    { input: 'T1E2S3T4', result: 'T1E2S3T4' },
    { input: '!Test', result: 'Test' },
    { input: 'T!!!e$$$s&&&t///', result: 'Test' },
    { input: ')=(/&%$§%&/()Test', result: 'Test' }
];

nameTests.forEach(test => {
    let testResult = makeUsernameValid(test.input);

    if(testResult == test.result) {
        console.log(chalk.green(`[mgg-server] (UsernameParser) --> ${test.input} = ${testResult} (Expecting: ${test.result})`));
    } else {
        console.log(chalk.red(`[mgg-server] (UsernameParser) --> ${test.input} = ${testResult} (Expecting: ${test.result})`));
    }
});