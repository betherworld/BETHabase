pragma solidity ^0.4.23;

// https://solidity.readthedocs.io/en/v0.4.24/common-patterns.html#example
contract CommitmentTest {
    enum Stage {
        Commit,
        Reveal,
        Finished
    }

    event NextStage(Stage);
    event LogEvent(bytes32);

    Stage public stage = Stage.Commit;
    uint voter_count = 0;
    uint constant MAX_VOTER_COUNT = 1;

    modifier atStage(Stage _stage) {
        require(
            stage == _stage,
            "Function cannot be called at this time. Wrong stage."
        );
        _;
    }

    function nextStage() internal {
        stage = Stage(uint(stage) + 1);
        emit NextStage(stage);
    }

    modifier transitionWhenFull() {
        _;
        if (voter_count == MAX_VOTER_COUNT)
        {
            nextStage();
            voter_count = 0;
        }
    }

    mapping(address => bytes32) commited_votes;
    mapping(address => string) revealed_votes;

    function commit(bytes32 hashedStr) public
    atStage(Stage.Commit)
    transitionWhenFull
    {
        commited_votes[msg.sender] = hashedStr;
        voter_count += 1;
    }

    function reveal(string revealedStr) public
    atStage(Stage.Reveal)
    transitionWhenFull
    {
        emit LogEvent(bytes32(commited_votes[msg.sender]));
        emit LogEvent(bytes32(keccak256(revealedStr)));
        require(commited_votes[msg.sender] == keccak256(revealedStr),
            "CommitmentTest::reveal::Commit does not match reveal"
        );
        revealed_votes[msg.sender] = revealedStr;
        voter_count += 1;
    }

    function getCommit() public view returns (bytes32) {
        return commited_votes[msg.sender];
    }
    function getReveal() public view returns (string) {
        return revealed_votes[msg.sender];
    }

    // for client side:
    // https://web3js.readthedocs.io/en/1.0/web3-utils.html#soliditysha3
    // (you certainly would want to compute this on the client side, it just isn't correct yet)
    function hash(string str) public pure returns (bytes32) {
        return keccak256(str);
    }
}