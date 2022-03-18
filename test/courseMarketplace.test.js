
const CourseMarketplace = artifacts.require("CourseMarketplace")
const { catchRevert } = require("./utils/exceptions")

// Mocha - testing framework
// Chai - assertion JS library

const getBalance = async address => web3.eth.getBalance(address)
const toBN = value => web3.utils.toBN(value)

const getGas = async result => {
  const tx = await web3.eth.getTransaction(result.tx)
  const gasUsed = toBN(result.receipt.gasUsed)
  const gasPrice = toBN(tx.gasPrice)
  const gas= gasUsed.mul(gasPrice)

  return gas
}

contract("CourseMarketplace", accounts => {

  const courseId = "0x00000000000000000000000000003130"
  const proof = "0x0000000000000000000000000000313000000000000000000000000000003130"

  const courseId2 = "0x00000000000000000000000000002130"
  const proof2 = "0x0000000000000000000000000000213000000000000000000000000000002130"

  const value = "900000000"

  let _contract = null
  let contractOwner = null
  let buyer = null
  let courseHash = null

  before(async () => {
    _contract = await CourseMarketplace.deployed()
    contractOwner = accounts[0]
    buyer = accounts[1]
  })

  describe("Purchase the new course", () => {
    
    before(async () => {
      await _contract.purchaseCourse(courseId, proof, {
        from: buyer,
        value
      })
    })

    it("shoud NOT allow repurchase owned course", async () => {
     await catchRevert(_contract.purchaseCourse(courseId, proof, {
        from: buyer,
        value
      }))
    })

    it("can get purchased course hash by index", async () => {
      const index = 0
      courseHash = await _contract.getCourseHashAtIndex(index)
      const expectedHash = web3.utils.soliditySha3(
        { type: "bytes16", value: courseId },
        { type: "address", value: buyer }
      )
      assert.equal(courseHash, expectedHash, "Course hash do no match")
    })
    it("should match the purchased course data", async () => {
      const expectedIndex = 0
      const expectedState = 0
      const course = await _contract.getCourseByHash(courseHash)

      assert.equal(course.id, expectedIndex, `Course index should be ${expectedIndex}`)
      assert.equal(course.price, value, `Course index should be ${value}`)
      assert.equal(course.proof, proof, `Course proof should be ${proof}`)
      assert.equal(course.owner, buyer, `Course owner should be ${buyer}`)
      assert.equal(course.state, expectedState, `Course state should be ${expectedState}`)

    })
  })

  describe("Activate the purchased course", async () => {
   
    it("should NOT be able to activate course by NOT contract owner", async () => {
      await catchRevert(_contract.activateCourse(courseHash, {from: buyer}))
    })


    it("should have 'activated' status", async () => {
      await _contract.activateCourse(courseHash, {from: contractOwner })
      const course = await _contract.getCourseByHash(courseHash)
      const expectedState = 1
      
      assert.equal(course.state, expectedState, "Course should have 'activated' state")
    })
  })

  describe("Transfer ownership", () => {
    let currentOwner = null

    before(async () => {
      currentOwner = await _contract.getContractOwner()
    })

    it("getContractOwner should return deployer address", async () => {
      assert.equal(
        currentOwner,
        currentOwner,
        "Contract owner is not matching from getContractOwner function" )
    })

    it("Should NOT transfer ownership when contract owner is NOT sending TX", async () => {
      await catchRevert(_contract.transferOwnership(accounts[3], {from: accounts[4]}))
    })

    it("Should transfer ownership to  3rd address from 'accounts", async () => {
      await _contract.transferOwnership(accounts[2], {from: currentOwner})
      const owner = await _contract.getContractOwner()
      assert.equal(owner, accounts[2], "Contract owner is not account2")
    })

    it("Should transfer ownership back to initial contract owner", async () => {
      await _contract.transferOwnership(contractOwner, {from: accounts[2]})
      const owner = await _contract.getContractOwner()
      assert.equal(owner, contractOwner, "Contract owner is not set")
    })
  })

  describe("Deactivate Course", () => {
    let courseHash2 = null

    before(async () => {
      await _contract.purchaseCourse(courseId2, proof2, {from: buyer, value})
      courseHash2 = await _contract.getCourseHashAtIndex(1)
    })

    it("should NOT be able to deactivate the course by NOT contract owner", async () => {
      await catchRevert(_contract.deactivateCourse(courseHash2, {from: buyer}))
    })
    
    it("should have status of deactivated and price 0", async () => {
      await _contract.deactivateCourse(courseHash2, {from: contractOwner})
      const course = await _contract.getCourseByHash(courseHash2)
      const expectedState = 2
      const expectedPrice = 0

      assert.equal(course.state, expectedState, "Course is NOT deactivated!")
      assert.equal(course.price, expectedPrice, "Course price is not 0!")
    })
    
    it("should NOT be able activate deactivated course", async () => {
      await catchRevert(_contract.activateCourse(courseHash2, {from: contractOwner}))
    }) 
  })

  describe("Repurchase Course", () => {
    let courseHash2 = null

    before(async () => {
      courseHash2 =  await _contract.getCourseHashAtIndex(1)
    })

    it("should NOT repurchase when the course  doesn't exist", async () => {
      const notExistingHash = "0xe56d4c56dd64745d4c2a87cfdfac89d378b3b78cbcba703ef87f46d044d7fecf"
      await catchRevert(_contract.repurchaseCourse(notExistingHash, {from: buyer}))
    })
    
    it("should NOT allow repurchase course when buyer is not the owner", async () =>{
      const notExistingOwner = accounts[2]
      await catchRevert(_contract.repurchaseCourse(courseHash2, {from: notExistingOwner}))
    })
    
    it("should be ABLE to repurchase with original buyer", async () =>{
      const beforeTxBuyerBalance = await getBalance(buyer)
      const beforeTxContractBalance = await getBalance(_contract.address)

      const result = await _contract.repurchaseCourse(courseHash2, {from: buyer, value})

      const afterTxBuyerBalance = await getBalance(buyer)
      const afterTxContractBalance = await getBalance(_contract.address)

      const course = await _contract.getCourseByHash(courseHash2)
      const expectedState = 0
      const gas = await getGas(result)

      assert.equal(course.state, expectedState, "Course is NOT purchased state!")
      assert.equal(course.price, value, `Course price is NOT equal to ${value}`)

      assert.equal(
        toBN(beforeTxBuyerBalance).sub(toBN(value)).sub(gas).toString(),
        afterTxBuyerBalance,
        "Client balance is not correct!" )
      
      assert.equal(
        toBN(beforeTxContractBalance).add(toBN(value)).toString(),
        afterTxContractBalance,
        "Contract balance is not correct!" )
      
    })

    it("should NOT be able to repurchase purchased course", async () =>{
      await catchRevert(_contract.repurchaseCourse(courseHash2, {from: buyer}))
    })

  })
})

