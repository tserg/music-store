window.addEventListener('load', async () => {
// Modern dapp browsers...
  if (window.ethereum) {
      window.web3 = new Web3(ethereum);
      try {
          // Request account access if needed
          await ethereum.enable();
          App.initAccount();

      } catch (error) {
          console.log("Please enable access to Metamask");
      }
  }
  // Legacy dapp browsers...
  else if (window.web3) {
      window.web3 = new Web3(web3.currentProvider);
      // Acccounts always exposed
      App.initAccount();

  }
  // Non-dapp browsers...
  else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
  }
});

App = {
  Web3Provider: null,
  contracts: {},

  initAccount: function() {

    App.web3Provider = web3.currentProvider;
    // Display current wallet
    var account = web3.eth.accounts[0];

    var accountInterval = setInterval(function() {
      if (web3.eth.accounts[0] !== account) {
        account = web3.eth.accounts[0];
        window.location.reload(true);
      }
    }, 100);

    document.getElementById("account").innerHTML = account;

    // Display current wallet ETH balance
    var accountWeiBalance = web3.eth.getBalance(account, function(error, result) {
      if (!error) {
        console.log(JSON.stringify(result));

        var accountBalance = web3.fromWei(result.toNumber(), "ether");
        document.getElementById("account_balance").innerHTML = accountBalance;

      } else {
        console.log(error);
      }
    });

    // Display status of current wallet i.e. admin privileges

    return App.initContract();
  },


  initContract: function() {
    $.getJSON('MusicStore.json', function(data) {
      //Get the necessary contract artifact file and instantiate it with truffle-contract
      var MusicStoreArtifact = data;
      App.contracts.MusicStore = TruffleContract(MusicStoreArtifact);

      // Set the provider for this contracts
      App.contracts.MusicStore.setProvider(App.web3Provider);

      return App.getReleaseId();

    });

    return App.bindEvents();

  },

  bindEvents: function() {


    var _btnListRelease = document.getElementById("btn-list-release");

    _btnListRelease.addEventListener("click", function() {
      return App.handleListRelease();
    });

    // one allows onclick to be work only once
    $(document).on('click', '.btn-release-buy', App.handleBuyRelease);
  },

  handleListRelease: function(event) {
    console.log("list release");

    var musicStoreInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.MusicStore.deployed().then(function(instance) {
        musicStoreInstance = instance;

        return musicStoreInstance.listRelease($("#list-release-artist-name").val(),
          $("#list-release-release-name").val(), [$("#list-release-tracks-names").val()],
          web3.toWei($("#list-release-release-price").val(), "ether"),
          web3.toWei($("#list-release-track-price").val(), "ether"), {from: account});
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  getReleaseId: function(releaseId) {

    var musicStoreInstance;

    App.contracts.MusicStore.deployed().then(function(instance) {
      musicStoreInstance = instance;

      return musicStoreInstance.releaseId.call();
    }).then(function(releaseId) {
      console.log("Releases: " + releaseId);
      document.getElementById("release-id").innerHTML = releaseId;
    }).catch(function(err){
      console.log(err.message);
    });

    return App.getTrackId();
  },

  getTrackId: function(trackId) {
    var musicStoreInstance;

    App.contracts.MusicStore.deployed().then(function(instance) {
      musicStoreInstance = instance;

      return musicStoreInstance.trackId.call();
    }).then(function(trackId) {
      document.getElementById("track-id").innerHTML = trackId;
    }).catch(function(err) {
      console.log(err.message);
    });
    return App.getContractOwnerDashboard();
  },

  getContractOwnerDashboard: function(address) {
    var musicStoreInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.MusicStore.deployed().then(function(instance) {
        musicStoreInstance = instance;

        return musicStoreInstance.owner.call();
      }).then(function(address) {

        if (account == address) {
          var contractOwnerDashboard = document.getElementById("contract-owner-dashboard");
          contractOwnerDashboard.style.display = "block";

          // create title for contractOwnerDashboard

          var contractOwnerDashboardTitle = document.createElement("h3");
          contractOwnerDashboardTitle.innerHTML = "Contract Owner Dashboard";

          contractOwnerDashboard.appendChild(contractOwnerDashboardTitle);


          // create div for emergency function

          var contractOwnerDashboardEmergency = document.createElement("div");
          contractOwnerDashboardEmergency.class = "sub-dashboard";
          var contractOwnerDashboardEmergencyTitle = document.createElement("h4");
          contractOwnerDashboardEmergencyTitle.innerHTML = "Toggle contract functions in case of emergency";

          // create span for emergency status

          var contractOwnerDashboardEmergencyStatus = document.createElement("span");
          contractOwnerDashboardEmergencyStatus.setAttribute("id", "emergency-status");
          contractOwnerDashboardEmergencyStatus.innerHTML = "Click here for current contract status";
          contractOwnerDashboardEmergencyStatus.addEventListener("click", function() {
            return App.handleGetEmergencyStatus();
          });

          // create span for emergency button
          var contractOwnerDashboardEmergencyButtonPlaceholder = document.createElement("span");
          var contractOwnerDashboardEmergencyButton = document.createElement("button");
          contractOwnerDashboardEmergencyButton.type = "button";
          contractOwnerDashboardEmergencyButton.class = "btn-emergency";
          contractOwnerDashboardEmergencyButton.innerHTML = "Toggle";
          contractOwnerDashboardEmergencyButton.addEventListener("click", function() {
            return App.handleEmergency();
          });

          // create div for kill contract function

          var contractOwnerDashboardKillContract = document.createElement("div");
          contractOwnerDashboardKillContract.class = "sub-dashboard";
          var contractOwnerDashboardKillContractTitle = document.createElement("h4");
          contractOwnerDashboardKillContractTitle.innerHTML = "Kill contract";

          // create span for emergency button
          var contractOwnerDashboardKillContractButtonPlaceholder = document.createElement("span");
          var contractOwnerDashboardKillContractButton = document.createElement("button");
          contractOwnerDashboardKillContractButton.type = "button";
          contractOwnerDashboardKillContractButton.class = "btn-kill-contract";
          contractOwnerDashboardKillContractButton.innerHTML = "Kill contract";
          contractOwnerDashboardKillContractButton.addEventListener("click", function() {
            return App.handleKillContract();
          });


          // append all elements

          contractOwnerDashboardEmergencyButtonPlaceholder.appendChild(contractOwnerDashboardEmergencyButton);
          contractOwnerDashboardEmergency.appendChild(contractOwnerDashboardEmergencyTitle);
          contractOwnerDashboardEmergency.appendChild(contractOwnerDashboardEmergencyStatus);
          contractOwnerDashboardEmergency.appendChild(contractOwnerDashboardEmergencyButtonPlaceholder);

          contractOwnerDashboard.appendChild(contractOwnerDashboardEmergency);

          contractOwnerDashboardKillContractButtonPlaceholder.appendChild(contractOwnerDashboardKillContractButton);
          contractOwnerDashboardKillContract.appendChild(contractOwnerDashboardKillContractTitle);
          contractOwnerDashboardKillContract.appendChild(contractOwnerDashboardKillContractButtonPlaceholder);

          contractOwnerDashboard.appendChild(contractOwnerDashboardKillContract);
        }

      }).catch(function(err) {
        console.log(err.message);
      });
    });
    return App.createReleasesPlaceholder();
  },

  createReleasesPlaceholder: function(releaseId) {
    var musicStoreInstance;

    App.contracts.MusicStore.deployed().then(function(instance) {
      musicStoreInstance = instance;

      return musicStoreInstance.releaseId.call();
    }).then(function(releaseId) {
      var _releaseId = releaseId;

      for (var i = 1; i <= _releaseId; i++) {
        var box = document.createElement("div");
        box.className = "release-box";

        box.setAttribute("id", "release" +i);

        var parent = document.getElementById("master-box");
        parent.appendChild(box);
      };
    }).catch(function(err) {
      console.log(err.message);
    });

    return App.populateReleasesPlaceholder();
  },

  populateReleasesPlaceholder: function(release) {
    var musicStoreInstance;
    var releaseCount;

    releaseCount = $("#master-box > div").length;

    if (releaseCount == 0) {
      document.getElementById("master-box").innerHTML = "There are no releases listed for sale.";
    }

    for (var j = 1; j <= releaseCount; j++) {

      /* for asynchronous execution of function: to lock in value of j
        https://stackoverflow.com/questions/11488014/asynchronous-process-inside-a-javascript-for-loop
      */
      (function(cntr) {
        var currentBoxId = "release-" + j;
        var currentBox = document.getElementById(currentBoxId);

        App.contracts.MusicStore.deployed().then(function(instance) {
          musicStoreInstance = instance;

          return musicStoreInstance.releaseList.call(cntr);
        }).then(function(release) {

          var currentReleaseId = document.createElement("span");
          currentReleaseId.className = "release-box-details";
          currentReleaseId.innerHTML = "Release #: " + (release[0]);

          var currentReleaseArtistName = document.createElement("span");
          currentReleaseArtistName.className = "release-box-details";
          currentReleaseArtistName.innerHTML = "Artist Name: " + release[1];

          var currentReleaseName = document.createElement("span");
          currentReleaseName.className = "release-box-details";
          currentReleaseName.innerHTML = "Release Name: " + release[2];

          var currentReleasePrice = document.createElement("span");
          currentReleasePrice.className = "release-box-details";
          currentReleasePrice.innerHTML = "Price: " + web3.fromWei(release[4], "ether");
          currentReleasePrice.setAttribute("id", "price-"+ release[0]);

          var currentReleaseSeller = document.createElement("span");
          currentReleaseSeller.className = "release-box-details";
          currentReleaseSeller.innerHTML = "Seller: " + release[5];


          currentBox.appendChild(currentReleaseId);
          currentBox.appendChild(currentReleaseArtistName);
          currentBox.appendChild(currentReleaseName);
          currentBox.appendChild(currentReleasePrice);
          currentBox.appendChild(currentReleaseSeller);


          var buyButton = document.createElement("button");
          buyButton.className = "btn-release-buy";
          buyButton.setAttribute("type", "button")
          buyButton.setAttribute("id", release[0]);
          buyButton.innerHTML = "Buy this release";
          currentBox.appendChild(buyButton);

        }).catch(function(err) {
          console.log(err.message);
        });
      })(j);
    };
  },

  handleBuyRelease: function(event) {

    var _sku = parseInt(($(event.target).attr("id")));

    var purchasePrice = parseFloat($("#price-"+_sku).html().substring(7));

    var weiPurchasePrice = web3.toWei(purchasePrice, 'ether');

    var musicStoreInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.MusicStore.deployed().then(function(instance) {
        musicStoreInstance = instance;

        return musicStoreInstance.buyRelease(_sku, {from: account, value: weiPurchasePrice});
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },


  handleEmergency: function(event) {

    var musicStoreInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.MusicStore.deployed().then(function(instance) {
        musicStoreInstance = instance;

        return musicStoreInstance.toggleContractActive();
      }).catch(function(err) {
        console.log(err.message);
      });

    });
  },

  handleGetEmergencyStatus: function(event) {

    var musicStoreInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.MusicStore.deployed().then(function(instance) {
        musicStoreInstance = instance;

        return musicStoreInstance.stopped.call();
      }).then(function(result) {

        if (result == true) {
          document.getElementById("emergency-status").innerHTML = "Stopped";
        } else {
          document.getElementById("emergency-status").innerHTML = "Active";
        }

      }).catch(function(err) {
        console.log(err.message);
      });

    });
  },

  handleKillContract: function(event) {

    var musicStoreInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.MusicStore.deployed().then(function(instance) {
        musicStoreInstance = instance;

        return musicStoreInstance.kill();
      }).catch(function(err) {
        console.log(err.message);
      });

    });
  }



};
