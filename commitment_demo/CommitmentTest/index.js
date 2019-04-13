const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
const ACCOUNT = web3.eth.accounts[0];
document.getElementById("account_addr").innerText = ACCOUNT;

const Stages = [
    "Commit",
    "Reveal",
    "Finished"
];

async function main()
{
    const abi = await (await fetch("abi.json")).json();
    console.log(abi);
    const CommitmentTestContract = web3.eth.contract(abi);
    // In your nodejs console, execute contractInstance.address to get the address at which the contract is deployed and change the line below to use your deployed address
    const address = await ((await fetch("address.txt")).text());
    console.log("address", address);
    backend = CommitmentTestContract.at(address);
    
    backend.NextStage(function (error, result) {
        console.log("NextStage", arguments);
        console.log("NextStage data: ", result.args);
        document.getElementById("log").innerText += `\nNext stage: ${Stages[result.args[""].valueOf()]}`;
    });
    backend.LogEvent(function (error, result) {
        console.log("LogEvent", arguments);
        console.log("LogEvent data: ", result.args);
    });
    console.log(backend.hash.call(web3.fromAscii("hi there")));
    // console.log(CommitmentTest.log(web3.fromAscii("hi there"), {from: ACCOUNT}));
}

main();

async function hash(str)
{
    return backend.hash.call(web3.fromAscii(str));
}

async function commit(str)
{
    await backend.commit(await hash(str), {from: ACCOUNT, gas: 300000}, function () {});
    await displayCommit()
}

async function reveal(str)
{
    await backend.reveal(web3.fromAscii(str), {from: ACCOUNT, gas: 300000});
    await displayReveal()
}

async function userCommit()
{
    const str = prompt("Please enter your vote");
    if (confirm(
        `Commit to vote?
Vote: ${str}
Hash (will be submitted): ${await hash(str)}`
    ))
        await commit(str);
}

async function userReveal()
{
    const str = prompt("Please enter your vote again");
    if (confirm(
        `Confirm vote:
Vote (will be submitted): ${str}
Hash: ${await hash(str)}`
    ))
        try
        {
            await reveal(str);
            alert("Success!");
        } catch (e)
        {
            alert(`Failed!\n${e.message}`);
        }
}

async function displayCommit()
{
    document.getElementById("commit").innerText = backend.getCommit.call();
}

async function displayReveal()
{
    document.getElementById("reveal").innerText = web3.toAscii(backend.getReveal.call());
}