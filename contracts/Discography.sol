pragma solidity ^0.4.24;

library Discography {

  struct Release {
    uint releaseSku;
    string artist;
    string name;
    uint tracksCount;
    uint price;
    address seller;
    address[] purchasers;
  }

  struct Track {
    uint releaseSku;
    uint trackSku;
    string artist;
    string name;
    uint price;
    address seller;
    address[] purchasers;
  }

  /** @dev Update item status to Sold
    * @param self The item that was sold
    */
  function updateReleaseSold(Release storage self, address _purchaserAddress)
    public
  {
    self.purchasers.push(_purchaserAddress);
  }

}
