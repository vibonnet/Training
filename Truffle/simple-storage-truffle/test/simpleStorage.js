'use strict';

const SimpleStorage = artifacts.require("SimpleStorage");

contract("SimpleStorage", accounts => {
    it('sould store the value 89', async () => {
        const simpleStorageInstance = await SimpleStorage.deployed();

        await simpleStorageInstance.set(89, { from: accounts[0]});

        const storedData = await simpleStorageInstance.get.call();

        assert.equal(89, storedData, "The value 89 was not stored.");
    });
});