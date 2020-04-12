/**
 * Arquivo exemplo para teste de api
 *
 * @author Sergio Mufalo <sergiojrm02@gmail.com>
 */
'use strict';

var should = require("should");
var request = require("request");
var chai = require("chai");
var expect = chai.expect;
var urlBase = "http://0.0.0.0:8080";


function makeid(length) {
    var result = '';
    var characters = 'ACTG';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

describe("Teste API (GET e POST) ML Simios", function () {
    it("Consulta Human x Simio", function (done) {
        request.get(
            {
                url: urlBase
            },
            function (error, response, body) {
                expect(response.statusCode).to.equal(200);

                done();
            }
        );
    });

    it("Validar uma matriz NxN (Simio ou Humano)", function (done) {
        var randomLimit = Math.floor((Math.random() * 12) + 4)
        var dnaRandom = []

        for (let i = 0; i < randomLimit; i++) {
            dnaRandom.push(makeid(randomLimit))
        }
        var dnaBodyRandom = {
            "dna": dnaRandom
        }

        request.post(
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': JSON.stringify(dnaBodyRandom).length
                },
                url: urlBase,
                body: JSON.stringify(dnaBodyRandom)
            },
            function (error, response, body) {

                expect(error).to.be.null
                expect(response.statusCode).to.equals(200, 'Not is Simio')

                done();
            }
        );
    });
});