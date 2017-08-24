pragma solidity ^0.4.8;

contract Token {
  string public constant name = "FundYourselfNow Token";
  string public constant symbol = "FYN";
  uint8 public constant decimals = 18;  // 18 is the most common number of decimal places

  address public walletAddress;
  uint256 public creationTime;
  bool public transferStop;

  /* This creates an array with all balances */
  mapping (address => uint256) public balanceOf;
  uint totalSupply;

  event FundTransfer(address indexed from, address indexed to, uint256 value);
  //event MilestonePaymentProcessed(address indexed from, address indexed to, uint256 value);

  function Token (uint initialBalance, address wallet)  {
    uint nowTime = now * 1000;
    balanceOf[wallet] = initialBalance;
    totalSupply = initialBalance;
    walletAddress = wallet;
    creationTime = nowTime;
    transferStop = true;
  }

  function getTotalSupply() constant returns (uint supply) {
    return totalSupply;
  }

  function getBalanceOf( address who ) constant returns (uint value) {
    return balanceOf[who];
  }

  /* Send token */
  function transfer(address _to, uint256 _value) {
      if (balanceOf[msg.sender] < _value) throw;
      if (balanceOf[_to] + _value < balanceOf[_to]) throw;
      balanceOf[msg.sender] -= _value;
      balanceOf[_to] += _value;
      FundTransfer(msg.sender, _to, _value);
  }

  /* Send token */
  function transferFrom(address _from, address _to, uint256 _value) {
      if (balanceOf[_from] < _value) throw;
      if (balanceOf[_to] + _value < balanceOf[_to]) throw;
      balanceOf[_from] -= _value;
      balanceOf[_to] += _value;
      FundTransfer(_from, _to, _value);
  }
}

contract FundRaising {
  address public owner;

  // Status in each stage of Job
  enum Status {CREATED, PUBLISHED, TARGETACHIEVED, EXPIRED, REFUNDED, ASSIGNED, COMPLETED}

  enum MilestoneStatus {CREATED, COMPLETED, REVIEWED, PAYOUT}

  // Job Object
  struct Job {
    string referenceNumber;
    string jobTitle;
    string description;
    uint fundRequired;
    Token token;
    uint achievedAmount;
    uint appliedDate;
    uint targetDate;
    address creator;
    address vendor;
    Status status;
  }

  // Milestone Object
  struct Milestone {
    string referenceNumber; // this is to link the Milestone with the job
    address vendor;
    string description; // name or description about the Milestone
    uint completionDate;
    uint completedDate;
    uint paymentPercentage;
    MilestoneStatus status;
  }

  Job[] jobs;

  Milestone[] milestones;

  // modifier to allow only owner has full control on the function
  modifier onlyOwnder {
    if (msg.sender != owner) {
      throw;
    } else {
      _;
    }
  }

  // Delete / kill the contract... only the owner has rights to do this
  function kill() onlyOwnder {
    suicide(owner);
  }

  function FundRaising() payable {
    owner = msg.sender;
  }

  // Create a new job with description, fund required and target date to achieve.
  function createJob(string _referenceNumber, string _jobTitle, address _creator, string _description, uint _fundRequired, uint _targetDate) payable {
    uint nowTime = now * 1000;
    Token jobToken = new Token(_fundRequired, _creator);
    jobs.push(Job({
      referenceNumber : _referenceNumber,
      jobTitle : _jobTitle,
      creator : _creator,
      vendor : _creator,
      description : _description,
      fundRequired : _fundRequired,
      token : jobToken,
      targetDate : _targetDate,
      appliedDate: nowTime,
      achievedAmount : 0,
      status : Status.CREATED
      }));
  }


  function createMilestone(string _referenceNumber, address _vendor, string _description, uint _completionDate, uint _paymentPercentage) {
    milestones.push(Milestone({
      referenceNumber : _referenceNumber,
      vendor : _vendor,
      description : _description,
      completionDate : _completionDate,
      completedDate : 0,
      paymentPercentage : _paymentPercentage,
      status : MilestoneStatus.CREATED
      }));
  }

  // Publish the job to receive fund.
  function publishJob(string _referenceNumber, address _creator) {
    for (uint i = 0; i < jobs.length; i++) {
      if (jobs[i].creator == _creator && sha3(jobs[i].referenceNumber) == sha3(_referenceNumber)) {
        jobs[i].status = Status.PUBLISHED;
      }
    }
  }

  // Assign vendor for the job to work.
  function assignVendor(string _referenceNumber, address _creator, address _vendor) {
    for (uint i = 0; i < jobs.length; i++) {
      if (jobs[i].creator == _creator && sha3(jobs[i].referenceNumber) == sha3(_referenceNumber)) {
        jobs[i].vendor = _vendor;
        jobs[i].status = Status.ASSIGNED;
      }
    }
  }

  // Check for the availability of job title by creator to avoid duplicate job
  function checkAvailableJob(string _referenceNumber, address _creator) public constant returns (bool) {
    bool available = false;
    for (uint i = 0; i < jobs.length; i++) {
      if (jobs[i].creator == _creator && sha3(jobs[i].referenceNumber) == sha3(_referenceNumber)) {
        available = true;
      }
    }
    return available;
  }

  // Send fund to job creator account from backer account
  function sendFund(string _referenceNumber, address _creator, address _backer, uint256 amount) payable {
    for (uint i = 0; i < jobs.length; i++) {
      if (jobs[i].creator == _creator && sha3(jobs[i].referenceNumber) == sha3(_referenceNumber)) {
        jobs[i].achievedAmount = jobs[i].achievedAmount + amount;
        jobs[i].token.transferFrom(_creator, _backer, amount);
        if (jobs[i].achievedAmount >= jobs[i].fundRequired) {
          jobs[i].status = Status.TARGETACHIEVED;
        }
      }
    }
  }

  function buyToken(string _referenceNumber, address _creator, address _backer, uint256 amount) payable {
    for (uint i = 0; i < jobs.length; i++) {
      if (jobs[i].creator == _creator && sha3(jobs[i].referenceNumber) == sha3(_referenceNumber)) {
        jobs[i].token.transferFrom(_creator, _backer, amount);
        jobs[i].achievedAmount = jobs[i].achievedAmount + amount;
        if (jobs[i].achievedAmount >= jobs[i].fundRequired) {
          jobs[i].status = Status.TARGETACHIEVED;
        }
      }
    }
  }

  // Send fund to job creator account from backer account
  function forceRefundFund(string _referenceNumber, address _creator, address _backer, uint256 amount) payable {
    for (uint i = 0; i < jobs.length; i++) {
      if (jobs[i].creator == _creator && sha3(jobs[i].referenceNumber) == sha3(_referenceNumber)) {
        jobs[i].achievedAmount = jobs[i].achievedAmount - amount;
        jobs[i].token.transferFrom(_backer, _creator, amount);
        if (jobs[i].achievedAmount >= jobs[i].fundRequired) {
          jobs[i].status = Status.TARGETACHIEVED;
        } else {
          jobs[i].status = Status.PUBLISHED;
        }
      }
    }
  }

  // Change the Job Status
  function updateStatus(uint index, uint statusIndex) {
    if (statusIndex == 2) {
      jobs[index].status = Status.TARGETACHIEVED;
    } else if (statusIndex == 3) {
      jobs[index].status = Status.EXPIRED;
    } else if (statusIndex == 4) {
      jobs[index].status = Status.REFUNDED;
    } else if (statusIndex == 5) {
      jobs[index].status = Status.ASSIGNED;
    } else if (statusIndex == 6) {
      jobs[index].status = Status.COMPLETED;
    }
  }

  // Change the Job Status
  function updateStatusByJobReferenceNumber(string _referenceNumber, address _creator, uint statusIndex) {
    for (uint i = 0; i < jobs.length; i++) {
      if (jobs[i].creator == _creator && sha3(jobs[i].referenceNumber) == sha3(_referenceNumber)) {
        if (statusIndex == 2) {
          jobs[i].status = Status.TARGETACHIEVED;
        } else if (statusIndex == 3) {
          jobs[i].status = Status.EXPIRED;
        } else if (statusIndex == 4) {
          jobs[i].status = Status.REFUNDED;
        } else if (statusIndex == 5) {
          jobs[i].status = Status.ASSIGNED;
        } else if (statusIndex == 6) {
          jobs[i].status = Status.COMPLETED;
        }
      }
    }
  }

  function updateMilestoneStatus(uint index, uint statusIndex) {
    if (statusIndex == 1) {
      uint nowTime = now * 1000;
      milestones[index].status = MilestoneStatus.COMPLETED;
      milestones[index].completedDate = nowTime;
    } else if (statusIndex == 2) {
      milestones[index].status = MilestoneStatus.REVIEWED;
    } else if (statusIndex == 3) {
      milestones[index].status = MilestoneStatus.PAYOUT;
    }
  }

  // Automatically check and update the job status
  function triggerStatus() payable {
      uint nowTime = now * 1000;
      for (uint i = 0; i < jobs.length; i++) {
        if (jobs[i].status == Status.PUBLISHED) {
          if (jobs[i].achievedAmount >= jobs[i].fundRequired) {
            jobs[i].status = Status.TARGETACHIEVED;
          } else if (jobs[i].targetDate <= nowTime) {
            jobs[i].status = Status.EXPIRED;
          }
        } else if (jobs[i].status == Status.CREATED){
          if (jobs[i].targetDate <= nowTime) {
            jobs[i].status = Status.EXPIRED;
          }
        }
      }
  }

  // Get all job counts
  function getJobCount() public constant returns (uint) {
		return jobs.length;
	}

  // Get the job counts by the creator
  function getJobCountByCreator(address _creator) public constant returns (uint) {
    uint count = 0;
    for (uint i = 0; i < jobs.length; i++) {
      if (jobs[i].creator == _creator) {
        count++;
      }
    }
		return count;
	}

  // This helps to send the multiple strigs as single to avoid too many parameter returns from the contract
  function strConcat(string _a, string _b, string _c, string _d, string _e) internal returns (string){
      bytes memory _ba = bytes(_a);
      bytes memory _bb = bytes(_b);
      bytes memory _bc = bytes(_c);
      bytes memory _bd = bytes(_d);
      bytes memory _be = bytes(_e);
      string memory abcde = new string(_ba.length + _bb.length + _bc.length + _bd.length + _be.length);
      bytes memory babcde = bytes(abcde);
      uint k = 0;
      for (uint i = 0; i < _ba.length; i++) babcde[k++] = _ba[i];
      for (i = 0; i < _bb.length; i++) babcde[k++] = _bb[i];
      for (i = 0; i < _bc.length; i++) babcde[k++] = _bc[i];
      for (i = 0; i < _bd.length; i++) babcde[k++] = _bd[i];
      for (i = 0; i < _be.length; i++) babcde[k++] = _be[i];
      return string(babcde);
  }

  // Get the job detail by the current index or position
  function getJobDetail(uint index) public constant returns (address, string, uint, uint, uint, uint, Status){
    return (jobs[index].creator, strConcat(jobs[index].referenceNumber, ":::", jobs[index].jobTitle, ":::", jobs[index].description), jobs[index].fundRequired, jobs[index].achievedAmount, jobs[index].targetDate, jobs[index].appliedDate, jobs[index].status);
  }

  function getJobVendor(uint index) public constant returns(address) {
    return jobs[index].vendor;
  }

  // Get the job detail by job title and creator
  function getJobDetailByJobTitle(string _referenceNumber, address _creator) public constant returns (string, string, uint, uint, uint,uint, Status){
    for (uint i = 0; i < jobs.length; i++) {
      if (jobs[i].creator == _creator && sha3(jobs[i].referenceNumber) == sha3(_referenceNumber)) {
        return (jobs[i].jobTitle, jobs[i].description, jobs[i].fundRequired, jobs[i].achievedAmount, jobs[i].targetDate, jobs[i].appliedDate, jobs[i].status);
      }
    }
    return ("", "", 0, 0, 0, 0, Status.CREATED);
  }

  // Get all milestones counts
  function getMilestoneCount() public constant returns (uint) {
		return milestones.length;
	}

  // Get the job detail by the current index or position
  function getMilestoneDetail(uint index) public constant returns (string, address, string, uint, uint, uint, MilestoneStatus){
    return (milestones[index].referenceNumber, milestones[index].vendor, milestones[index].description, milestones[index].completionDate, milestones[index].completedDate, milestones[index].paymentPercentage, milestones[index].status);
  }

  function getMyTokenBalanceByReferenceNumber(string _referenceNumber, address _creator, address _backer) public constant returns(uint) {
    uint myBalance = 0;
    for (uint i = 0; i < jobs.length; i++) {
      if (jobs[i].creator == _creator && sha3(jobs[i].referenceNumber) == sha3(_referenceNumber)) {
        myBalance = jobs[i].token.getBalanceOf(_backer);
      }
    }
    return myBalance;
  }

  function getMyTokenBalance(uint index, address _backer) public constant returns(uint) {
    uint myBalance = jobs[index].token.getBalanceOf(_backer);
    return myBalance;
  }
}
