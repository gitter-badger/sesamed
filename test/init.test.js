const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
var sinonChai = require("sinon-chai");
const ethers = require("ethers");
const sesamed = require("../src/sesamed");

chai.use(sinonChai);
chai.should();

describe("init", async function () {
    it("should be a function", async function () {
        expect(sesamed.init).to.be.a("function");
    });
    xit("should call ethers.Wallet", async function () {
        let JsonRpcProvider = sinon.stub(ethers.providers.JsonRpcProvider.prototype).returns("provider2");
        let Wallet = sinon.stub(ethers, "Wallet");
        /*let Contract = sinon.stub(ethers, "Contract").returns({
            connect: sinon.stub().returns()
        });*/

        sesamed.init({rpc: "rpc1", privateKey: "pk2"});

        JsonRpcProvider.should.have.been.calledWith("rpc1");
        Wallet.should.have.been.calledWith("pk2", "provider1");

    });
});