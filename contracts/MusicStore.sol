pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "./Discography.sol";

contract MusicStore {

  // set owner
  address public owner;

  // circuit breaker

  bool public stopped = false;

  /*
    releaseId: total number of releases listed
    trackId: total number of tracks listed
  */
  uint public releaseId;
  uint public trackId;

  /*
    releaseList: releaseId mapped to Release
    trackList: trackId mapped to Track
  */

  mapping (uint => Discography.Release) public releaseList;
  mapping (uint => Discography.Track) public trackList;

  event ReleaseListed(uint releaseId, string releaseArtist, string releaseName, uint releaseTracksCount);
  event TrackListed(uint releaseId, uint trackId, string trackArtist, string trackName);

  event ReleaseSold(uint releaseId, uint releasePricePaid, address purchaser);
  event TrackSold(uint trackId, uint trackPricePaid, address purchaser);

  modifier verifyOwner { require(msg.sender == owner); _;}

  modifier paidEnough(uint _price) {require(msg.value >= _price); _;}
  modifier checkReleaseValue(uint _sku, address _buyer) {
    _;
    uint _price = releaseList[_sku].price;
    uint amountToRefund = msg.value - _price;
    _buyer.transfer(amountToRefund);
  }
  modifier checkTrackValue(uint _sku, address _buyer) {
    _;
    uint _price = trackList[_sku].price;
    uint amountToRefund = msg.value - _price;
    _buyer.transfer(amountToRefund);
  }

  modifier stopInEmergency { require(!stopped); _;}

  constructor() public {
    owner = msg.sender;
    releaseId = 0;
    trackId = 0;
  }

  /** @dev Lists a release for sale
    * @param _artistName Name of the artist
    * @param _releaseName Name of the release
    * @param _trackNames Names of the tracks
    * @param _releasePrice Price of the release
    * @param _trackPrice Price of each track
    */
  function listRelease(string _artistName, string _releaseName, string[] _trackNames,
    uint _releasePrice, uint _trackPrice)
    public
    stopInEmergency
  {
    // ensure _artistName, _releaseName and _trackNames are not empty
    bytes memory tempName1 = bytes(_artistName);
    require(tempName1.length > 0);

    bytes memory tempName2 = bytes(_releaseName);
    require(tempName2.length > 0);


    // ensure _releasePrice and _trackPrice are positive
    require(_releasePrice > 0);
    require(_trackPrice > 0);

    releaseId += 1;

    uint _tracksCount = _trackNames.length;

    address[] memory _releasePurchasers;

    releaseList[releaseId] = Discography.Release({releaseSku: releaseId, artist: _artistName,
      name: _releaseName, tracksCount: _tracksCount, price: _releasePrice,
      seller: msg.sender, purchasers: _releasePurchasers});

    emit ReleaseListed(releaseId, _artistName, _releaseName, _tracksCount);

    for (uint i=0; i < _tracksCount; i++) {

      trackId += 1;

      address[] memory _trackPurchasers;

      trackList[trackId] = Discography.Track({releaseSku: releaseId, trackSku: trackId,
        artist: _artistName, name: _trackNames[i], price: _trackPrice, seller: msg.sender,
        purchasers: _trackPurchasers});
      emit TrackListed(releaseId, trackId, _artistName, _trackNames[i]);
    }

  }

  /** @dev Buys an item listed for sale
    * @param sku The id of the item to be bought
    */
  function buyRelease(uint sku)
    public
    payable
    stopInEmergency
    paidEnough(releaseList[sku].price)
    checkReleaseValue(sku, msg.sender)
  {
    Discography.updateReleaseSold(releaseList[sku], msg.sender);
    releaseList[sku].seller.transfer(releaseList[sku].price);
    emit ReleaseSold(sku, releaseList[sku].price, msg.sender);
  }


  /** @dev Return the name of a Release Id
    * @param _releaseId The Release to look up
    * @return _releaseName The name of the release
    */
  function fetchReleaseName(uint _releaseId)
    public
    view
    returns (string _releaseName)
  {
    _releaseName = releaseList[_releaseId].name;
  }

  /** @dev Destroy the contract
    */
  function kill()
    public
    verifyOwner
  {
    selfdestruct(owner);
  }

  /** @dev Stop the contract
    */
  function toggleContractActive()
    public
    verifyOwner
  {
    stopped = !stopped;
  }


}
