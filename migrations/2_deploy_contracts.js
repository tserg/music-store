var MusicStore = artifacts.require("MusicStore");
var Discography = artifacts.require("Discography");

module.exports = function(deployer) {
  deployer.deploy(Discography);
  deployer.link(Discography, MusicStore);
  deployer.deploy(MusicStore);
};
