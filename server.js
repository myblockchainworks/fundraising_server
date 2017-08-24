var express = require('express'),
    cors = require('cors'),
    app = express();
//var router = express.Router();
var bodyParser = require('body-parser');
var Web3 = require('web3');

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

//session configs
var expressSession = require('express-session');
var cookieParser = require('cookie-parser'); // the session is stored in a cookie, so we use this to parse it


app.use(cookieParser());

app.use(expressSession({
    secret: 'test_session',
    resave: false,
    saveUninitialized: true
}));


//For enabling CORS
app.use(cors());


var web3;
if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    web3 = new Web3(new Web3.providers.HttpProvider("http://10.0.0.6:8545"));
    console.log(web3.net.peerCount);
}

//web3.eth.defaultAccount = 0xaf148d7e9c5a1f6ee493f0a808fdc877953bf273;
web3.eth.defaultAccount=web3.eth.accounts[0];

var fundraisingContractAddress = "0x76804e6c6b1ed4df0c5a4a2be05e179544d5f3c8";

var fundraisingContractABI = [ { "constant": false, "inputs": [ { "name": "_referenceNumber", "type": "string" }, { "name": "_creator", "type": "address" } ], "name": "publishJob", "outputs": [], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_referenceNumber", "type": "string" }, { "name": "_creator", "type": "address" }, { "name": "_vendor", "type": "address" } ], "name": "assignVendor", "outputs": [], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "index", "type": "uint256" }, { "name": "statusIndex", "type": "uint256" } ], "name": "updateMilestoneStatus", "outputs": [], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_referenceNumber", "type": "string" }, { "name": "_creator", "type": "address" }, { "name": "_backer", "type": "address" }, { "name": "amount", "type": "uint256" } ], "name": "forceRefundFund", "outputs": [], "payable": true, "type": "function" }, { "constant": false, "inputs": [ { "name": "_referenceNumber", "type": "string" }, { "name": "_creator", "type": "address" }, { "name": "statusIndex", "type": "uint256" } ], "name": "updateStatusByJobReferenceNumber", "outputs": [], "payable": false, "type": "function" }, { "constant": false, "inputs": [], "name": "kill", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "_referenceNumber", "type": "string" }, { "name": "_creator", "type": "address" } ], "name": "checkAvailableJob", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_referenceNumber", "type": "string" }, { "name": "_vendor", "type": "address" }, { "name": "_description", "type": "string" }, { "name": "_completionDate", "type": "uint256" }, { "name": "_paymentPercentage", "type": "uint256" } ], "name": "createMilestone", "outputs": [], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_referenceNumber", "type": "string" }, { "name": "_creator", "type": "address" }, { "name": "_backer", "type": "address" }, { "name": "amount", "type": "uint256" } ], "name": "sendFund", "outputs": [], "payable": true, "type": "function" }, { "constant": false, "inputs": [], "name": "triggerStatus", "outputs": [], "payable": true, "type": "function" }, { "constant": true, "inputs": [ { "name": "index", "type": "uint256" }, { "name": "_backer", "type": "address" } ], "name": "getMyTokenBalance", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "_creator", "type": "address" } ], "name": "getJobCountByCreator", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "getMilestoneCount", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "getJobCount", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_referenceNumber", "type": "string" }, { "name": "_creator", "type": "address" }, { "name": "_backer", "type": "address" }, { "name": "amount", "type": "uint256" } ], "name": "buyToken", "outputs": [], "payable": true, "type": "function" }, { "constant": true, "inputs": [ { "name": "index", "type": "uint256" } ], "name": "getMilestoneDetail", "outputs": [ { "name": "", "type": "string" }, { "name": "", "type": "address" }, { "name": "", "type": "string" }, { "name": "", "type": "uint256" }, { "name": "", "type": "uint256" }, { "name": "", "type": "uint256" }, { "name": "", "type": "uint8" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "index", "type": "uint256" } ], "name": "getJobDetail", "outputs": [ { "name": "", "type": "address" }, { "name": "", "type": "string" }, { "name": "", "type": "uint256" }, { "name": "", "type": "uint256" }, { "name": "", "type": "uint256" }, { "name": "", "type": "uint256" }, { "name": "", "type": "uint8" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "index", "type": "uint256" }, { "name": "statusIndex", "type": "uint256" } ], "name": "updateStatus", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "index", "type": "uint256" } ], "name": "getJobVendor", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_referenceNumber", "type": "string" }, { "name": "_jobTitle", "type": "string" }, { "name": "_creator", "type": "address" }, { "name": "_description", "type": "string" }, { "name": "_fundRequired", "type": "uint256" }, { "name": "_targetDate", "type": "uint256" } ], "name": "createJob", "outputs": [], "payable": true, "type": "function" }, { "constant": true, "inputs": [ { "name": "_referenceNumber", "type": "string" }, { "name": "_creator", "type": "address" } ], "name": "getJobDetailByJobTitle", "outputs": [ { "name": "", "type": "string" }, { "name": "", "type": "string" }, { "name": "", "type": "uint256" }, { "name": "", "type": "uint256" }, { "name": "", "type": "uint256" }, { "name": "", "type": "uint256" }, { "name": "", "type": "uint8" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "_referenceNumber", "type": "string" }, { "name": "_creator", "type": "address" }, { "name": "_backer", "type": "address" } ], "name": "getMyTokenBalanceByReferenceNumber", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "type": "function" }, { "inputs": [], "payable": true, "type": "constructor" } ];

//contract data

var fundraisingContract = web3.eth.contract(fundraisingContractABI).at(fundraisingContractAddress);


app.get('/', function(req, res) {

    res.send("This is the API server developed for YouTube");
})

app.get('/getJobCount', function(req, res) {

    fundraisingContract.getJobCount.call(function(err, result) {
        //console.log(result);
        if (!err) {
            res.json({"jobCount":result});
        } else
            res.status(401).json("Error" + err);
    });
});

app.post('/getJobCountByCreator', function(req, res) {

    var creator = req.body._creator;

    fundraisingContract.getJobCountByCreator.call(creator, function(err, result) {
        //console.log(result);
        if (!err) {
            res.json({"jobCount":result});
        } else
            res.status(401).json("Error" + err);
    });
});

app.get('/getMilestoneCount', function(req, res) {

    fundraisingContract.getMilestoneCount.call(function(err, result) {
        //console.log(result);
        if (!err) {
            res.json({"milestoneCount":result});
        } else
            res.status(401).json("Error" + err);
    });
});

app.post('/createNewJob', function(req, res) {

     var referenceNumber = req.body._referenceNumber;
     var jobTitle = req.body._jobTitle;
     var creator = req.body._creator;
     var description = req.body._description;
     var fundRequired = req.body._fundRequired;
     var targetDate = req.body._targetDate;

     fundraisingContract.createJob.sendTransaction(referenceNumber, jobTitle, creator, description, fundRequired, targetDate, {
        from: web3.eth.defaultAccount,gas:4712388
     }, function(err, result) {
        console.log("Project Created : " + result);
        if (!err) {
            res.end(JSON.stringify(result));
        } else
            res.status(401).json("Error" + err);
    });

});

app.post('/createMilestone', function(req, res) {

     var referenceNumber = req.body._referenceNumber;
     var vendor = req.body._vendor;
     var description = req.body._description;
     var completionDate = req.body._completionDate;
     var paymentPercentage = req.body._paymentPercentage;

     fundraisingContract.createMilestone.sendTransaction(referenceNumber, vendor, description, completionDate, paymentPercentage, {
        from: web3.eth.defaultAccount,gas:4712388
     }, function(err, result) {
        console.log("Milestone Created : " + result);
        if (!err) {
            res.end(JSON.stringify(result));
        } else
            res.status(401).json("Error" + err);
    });
});

app.post('/publishJob', function(req, res) {

  var referenceNumber = req.body._referenceNumber;
  var creator = req.body._creator;

  fundraisingContract.publishJob.sendTransaction(referenceNumber, creator, {
     from: web3.eth.defaultAccount, gas:4712388
  }, function(err, result) {
     console.log("Project Published : " + result);
     if (!err) {
         res.end(JSON.stringify(result));
     } else
         res.status(401).json("Error" + err);
 });
});

app.post('/assignVendor', function(req, res) {

  var referenceNumber = req.body._referenceNumber;
  var creator = req.body._creator;
  var vendor = req.body._vendor;

  fundraisingContract.assignVendor.sendTransaction(referenceNumber, creator, vendor, {
     from: web3.eth.defaultAccount, gas:4712388
  }, function(err, result) {
     console.log("Vendor Assigned : " + result);
     if (!err) {
         res.end(JSON.stringify(result));
     } else
         res.status(401).json("Error" + err);
 });
});

app.post('/checkAvailableJob', function(req, res) {

  var referenceNumber = req.body._referenceNumber;
  var creator = req.body._creator;
  fundraisingContract.checkAvailableJob.call(referenceNumber, creator, function(err, result) {
     //console.log(result);
     if (!err) {
         res.end(JSON.stringify({"isAvailable":result}));
     } else
         res.status(401).json("Error" + err);
 });
});

app.post('/sendFund', function(req, res) {

  var referenceNumber = req.body._referenceNumber;
  var creator = req.body._creator;
  var backer = req.body._backer;
  var amount = req.body.amount;

  fundraisingContract.sendFund.sendTransaction(referenceNumber, creator, backer, amount, {
     from: web3.eth.defaultAccount, gas:4712388
  }, function(err, result) {
     console.log("Sent Fund : " + result);
     if (!err) {
         res.end(JSON.stringify(result));
     } else
         res.status(401).json("Error" + err);
 });
});

app.post('/forceRefundFund', function(req, res) {

  var referenceNumber = req.body._referenceNumber;
  var creator = req.body._creator;
  var backer = req.body._backer;
  var amount = req.body.amount;

  fundraisingContract.forceRefundFund.sendTransaction(referenceNumber, creator, backer, amount, {
     from: web3.eth.defaultAccount, gas:4712388
  }, function(err, result) {
     console.log("Forced Refunded : " + result);
     if (!err) {
         res.end(JSON.stringify(result));
     } else
         res.status(401).json("Error" + err);
 });
});

app.post('/buyProjectToken', function(req, res) {

  var referenceNumber = req.body._referenceNumber;
  var creator = req.body._creator;
  var backer = req.body._backer;
  var amount = req.body.amount;

  fundraisingContract.buyToken.sendTransaction(referenceNumber, creator, backer, amount, {
     from: web3.eth.defaultAccount, gas:4712388
  }, function(err, result) {
     console.log("Bought Project Token : " + result);
     if (!err) {
         res.end(JSON.stringify(result));
     } else
         res.status(401).json("Error" + err);
 });
});

app.post('/sendFundTransaction', function(req, res) {
  var creator = req.body._creator;
  var backer = req.body._backer;
  var amount = req.body.amount;
  web3.eth.sendTransaction({from:backer, to:creator, value: web3.toWei(amount, "ether")}, {
    from: web3.eth.defaultAccount, gas:4712388
  }, function(err, result) {
     console.log("Sent Fund Transaction : " + result);
     if (!err) {
         res.end(JSON.stringify(result));
     } else
         res.status(401).json("Error" + err);
 });
});

app.post('/triggerStatus', function(req, res) {
  fundraisingContract.triggerStatus.sendTransaction({ from: web3.eth.defaultAccount, gas:4712388
  }, function(err, result) {
     console.log("Triggered Updated Status : " + result);
     if (!err) {
         res.end(JSON.stringify(result));
     } else
         res.status(401).json("Error" + err);
 });
});

app.post('/updateJobStatus', function(req, res) {

  var currentIndex = req.body._currentIndex;
  var statusIndex = req.body._statusIndex;

  fundraisingContract.updateStatus.sendTransaction(currentIndex, statusIndex, { from: web3.eth.defaultAccount, gas:4712388
  }, function(err, result) {
     console.log("Updated Project Status : " + result);
     if (!err) {
         res.end(JSON.stringify(result));
     } else
         res.status(401).json("Error" + err);
 });
});

app.post('/updateJobStatusByJobReferenceNumber', function(req, res) {

  var referenceNumber = req.body._referenceNumber;
  var creator = req.body._creator;
  var statusIndex = req.body._statusIndex;

  fundraisingContract.updateStatusByJobReferenceNumber.sendTransaction(referenceNumber, creator, statusIndex, { from: web3.eth.defaultAccount, gas:4712388
  }, function(err, result) {
     console.log("Updated Project Status : " + result);
     if (!err) {
         res.end(JSON.stringify(result));
     } else
         res.status(401).json("Error" + err);
 });
});

app.post('/updateMilestoneStatus', function(req, res) {

  var currentIndex = req.body._currentIndex;
  var statusIndex = req.body._statusIndex;

  fundraisingContract.updateMilestoneStatus.sendTransaction(currentIndex, statusIndex, { from: web3.eth.defaultAccount, gas:4712388
  }, function(err, result) {
     console.log("Updated Milestone Status : " + result);
     if (!err) {
         res.end(JSON.stringify(result));
     } else
         res.status(401).json("Error" + err);
 });
});


app.post('/getJobDetail', function(req, res) {

    var currentIndex = req.body._currentIndex;

    fundraisingContract.getJobDetail.call(currentIndex, function(err, result) {
        //console.log(result);
        if (!err) {
            res.json({"Creator":result[0],"JobInfo":result[1],"FundRequired":result[2],"AchievedAmount":result[3], "TargetDate":result[4],  "AppliedDate":result[5], "Status":result[6]});
        } else
            res.status(401).json("Error" + err);
    });
});

app.post('/getJobVendor', function(req, res) {

    var currentIndex = req.body._currentIndex;

    fundraisingContract.getJobVendor.call(currentIndex, function(err, result) {
        //console.log(result);
        if (!err) {
            res.json({"Vendor":result});
        } else
            res.status(401).json("Error" + err);
    });
});

app.post('/getMilestoneDetail', function(req, res) {

    var currentIndex = req.body._currentIndex;

    fundraisingContract.getMilestoneDetail.call(currentIndex, function(err, result) {
        //console.log(result);
        if (!err) {
            res.json({"ReferenceNumber":result[0],"Vendor":result[1],"Description":result[2],"CompletionDate":result[3], "CompletedDate":result[4],  "PaymentPercentage":result[5], "Status":result[6]});
        } else
            res.status(401).json("Error" + err);
    });
});

app.post('/getJobDetailByJobTitle', function(req, res) {

    var referenceNumber = req.body._referenceNumber;
    var creator = req.body._creator;

    fundraisingContract.getJobDetailByJobTitle.call(referenceNumber, creator, function(err, result) {
        //console.log(result);
        if (!err) {
            res.json({"Title":result[0],"Description":result[1],"FundRequired":result[2],"AchievedAmount":result[3], "TargetDate":result[4], "AppliedDate":result[5], "Status":result[6]});
        } else
            res.status(401).json("Error" + err);
    });
});

app.post('/getMyTokenBalanceByReferenceNumber', function(req, res) {

  var referenceNumber = req.body._referenceNumber;
  var creator = req.body._creator;
  var backer = req.body._backer;

  fundraisingContract.getMyTokenBalanceByReferenceNumber.call(referenceNumber, creator, backer, function(err, result) {
     //console.log(result);
     if (!err) {
         res.json({"MyTokenBalance":result});
     } else
         res.status(401).json("Error" + err);
 });
});

app.post('/getMyTokenBalance', function(req, res) {
  var currentIndex = req.body._currentIndex;
  var backer = req.body._backer;

  fundraisingContract.getMyTokenBalance.call(currentIndex, backer, function(err, result) {
     //console.log(result);
     if (!err) {
         res.json({"MyTokenBalance":result});
     } else
         res.status(401).json("Error" + err);
 });
});

app.listen(3001, function() {
    console.log('app running on port : 3001');
});
