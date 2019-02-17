let expect = require("chai").expect;
let sesamed = require("../src/sesamed");

describe("createAccount", async function () {
    it("should be a function", async function () {
        expect(sesamed.createAccount).to.be.a("function");
    });
    it("should return an object", async function () {
        var account = await sesamed.createAccount({userIds: {name: "jochen"}, passwort: "test"});
        expect(account).to.be.an("object");
    });
});