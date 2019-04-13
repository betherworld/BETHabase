"use strict";
const Web3 = require('web3');
const fs = require('fs');

function require_solc(version = "0.4.23"){
    // const niv = require('npm-install-version');
    
    // niv.install('solc@0.5.7');
    // niv.install(`solc@${version}`);
    
    // return niv.require(`solc@${version}`);
    return require("solc")
}

module.exports = function (mainContractName, ...constructorParams) {
    const dir = `./${mainContractName}`;
    const filepaths = {
        abi: `${dir}/abi.json`,
        contractAddress: `${dir}/address.txt`,
    };
    if(!fs.existsSync(dir))
        fs.mkdirSync(dir);
    
    const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
    
    const code = fs.readFileSync(`${mainContractName}.sol`).toString();
    const solc = require_solc();
    const compiledCode = solc.compile(code);
    if(compiledCode.errors)
        return console.error(compiledCode.errors);
    
    const mainContract = compiledCode.contracts[`:${mainContractName}`];
    if(!mainContract)
        return console.error(`Contract "${mainContractName}" not found!`);
    const abiJson = mainContract.interface;
    fs.writeFileSync(filepaths.abi, abiJson);
    const abiDefinition = JSON.parse(abiJson);
    const contractDefinition = web3.eth.contract(abiDefinition);
    const byteCode = mainContract.bytecode;
    const deployedContract = contractDefinition.new(...constructorParams, {
        data: byteCode,
        from: web3.eth.accounts[0],
        gas: 4700000
    }, function (err, res) {
        // this is called twice for some reason
        // more: https://ethereum.stackexchange.com/questions/42576/double-callback-when-deploying-a-new-smart-contract-with-web3-and-metamask
        if(err)
            console.log("error: ", err);
        console.log("res.address: " + res.address);
        if (res.address)
        {
            fs.writeFileSync(filepaths.contractAddress, res.address);
        }
    });
};