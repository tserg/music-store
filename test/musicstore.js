var MusicStore = artifacts.require('MusicStore')

contract('MusicStore', function(accounts) {

  const owner = accounts[0]
  const alice = accounts[1]
  const bob = accounts[2]
  const charlie = accounts[3]
  const emptyAddress = "0x0000000000000000000000000000000000000000"

  /*
    Test 1: Tests whether an user can add a release
  */

  it("should add a release", async() => {

    const musicstore = await MusicStore.deployed({from: owner})

    var eventEmitted = false

    var event = musicstore.ReleaseListed()
    await event.watch((err,res) => {
      eventEmitted = true
    })


    await musicstore.listRelease("Muse", "BHAR", ["Starlight", "MOTP"],
      2, 1, {from: owner})

    const result = await musicstore.releaseId.call()

    assert.equal(result, 1, "the release was not added")
    assert.equal(eventEmitted, true, "adding a release should emit a ReleaseListed Event")
  })

})
