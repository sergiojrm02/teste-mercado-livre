'use strict';

const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const Promise = require("bluebird");
const env = process.env;

Promise.promisifyAll(mysql);
Promise.promisifyAll(require("mysql/lib/Connection").prototype);
Promise.promisifyAll(require("mysql/lib/Pool").prototype);

const HOST_DB = (env.HOST_DB == undefined) ? 'localhost' : env.HOST_DB;
const USER_DB = (env.USER_DB == undefined) ? 'toor' : env.USER_DB;
const PASS_DB = (env.PASS_DB == undefined) ? 'toor' : env.PASS_DB;
const NAME_DB = (env.NAME_DB == undefined) ? 'node_db' : env.NAME_DB;
const PORT_DB = (env.PORT_DB == undefined) ? '3306' : env.PORT_DB;

var pool = mysql.createPool({
    host: `${HOST_DB}`,
    user: `${USER_DB}`,
    password: `${PASS_DB}`,
    database: `${NAME_DB}`,
    port: `${PORT_DB}`
});

let response = {
    statusCode: 200,
    body: ''
};

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

exports.handler = function (event, context, callback) {
    console.log('event', JSON.stringify(event));
    console.log(env);

    if (event.path == '/simian' && event.httpMethod == 'POST') {
        return isSimian(event)
    } else {
        return ratioSimios()
    }
}

app.post('/simian', function (req, res) {
    isSimian(req, res);
});

app.get('/stats', (req, res) => {
    ratioSimios(res)
});

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

function responseCallback(code = 200, data = "", res = {}) {
    if (res.hasOwnProperty('_eventsCount') && res._eventsCount > 0) {
        res.status(code)
        res.send(data)
    }
    response.statusCode = code;
    response.body = JSON.stringify(data);
}

async function isSimian(req, res = {}) {
    try {
        var contentType = (req.headers.hasOwnProperty('Content-Type')? 'Content-Type' : 'content-type')
        if (req.headers[contentType] !== 'application/json') {
            console.log("Content-Type accepts application/json Not Acceptable")
            var msg = {
                error: "Not acceptable",
                info: "Content-Type accepts application/json"
            }
            responseCallback(406, msg, res)
            return response;
        }

        let body = (typeof req.body == 'string') ? JSON.parse(req.body) : req.body
        if (!body.hasOwnProperty('dna')) {
            console.log("DNA Not Acceptable")
            var msg = {
                error: "Bad Request",
                info: "DNA Not Acceptable"
            }
            responseCallback(406, msg, res)
            return response;
        }

        let hash = crypto.createHash('md5').update(body.dna.toString()).digest("hex")
        var arrDnaValid = body.dna
        var returnValidDb = await validDnaDb(arrDnaValid);

        if (returnValidDb.length > 0) {
            var isSimioValid = Boolean(returnValidDb[0].issimio)
            if (isSimioValid) {
                console.log("DNA already processed")
                var msg = {
                    error: "DNA already processed",
                    info: {"Is Simio": isSimioValid, 'Simio': returnValidDb[0].simio}
                }
                responseCallback(200, msg, res)
            } else {
                console.log("DNA already processed")
                var msg = {
                    error: "DNA already processed",
                    info: {"Is Simio": isSimioValid}
                }
                responseCallback(403, msg, res)
            }
            return response;
        } else {
            var arrProcess = await processDna(arrDnaValid)
            var statusProcess = arrProcess[0][0]
            var simioFound = arrProcess[1]
            var arrProcessColumn = arrProcess[2]
            var arrProcessDiagonal = arrProcess[3]

            // if (simioFound.length < 2 && arrProcessColumn.length > 0 && !statusProcess) {
            if (arrProcessColumn.length > 0 && !statusProcess) {
                // valida as string na vertical
                for (let i = 0; i < arrProcessColumn.length; i++) {
                    var booleanValid = await isStringSimio(arrProcessColumn[i])
                    if (booleanValid) {
                        simioFound.push('V >>> ' + arrProcessColumn[i])
                    }
                }

                // if(simioFound.length < 2 && arrProcessDiagonal.length > 0) {
                if (arrProcessDiagonal.length > 0) {
                    // valida as string na diagonal
                    for (let i = 0; i < arrProcessDiagonal.length; i++) {
                        var booleanValid = await isStringSimio(arrProcessDiagonal[i])
                        if (booleanValid) {
                            simioFound.push('D >>> ' + arrProcessDiagonal[i])
                        }
                    }
                }

                if (simioFound.length >= 2) {
                    await insertDb([simioFound.toString(), 1, JSON.stringify(arrDnaValid), hash])
                    var msg = {
                        error: "",
                        info: {"Simio": "Found", "Sequential Simio Found": simioFound.toString()}
                    }
                    responseCallback(200, msg, res)
                } else {
                    await insertDb([simioFound.toString(), 0, JSON.stringify(arrDnaValid), hash])
                    var msg = {
                        error: "",
                        info: {"Simio": "Not Found", "Sequential Simio Found": simioFound.toString()}
                    }
                    responseCallback(403, msg, res)
                }
            } else if (statusProcess == 1) {
                var msg = {
                    error: 'Bad Request',
                    info: arrProcess[0][1]
                }
                responseCallback(400, msg, res)
            }
        }
        return response;
    } catch (err) {
        console.log('Error => ' + err);
        var msg = {error: "Internal Server Error", "info": err.message}
        responseCallback(500, msg, res)
        return response;
    }
}

async function processDna(arrValid) {
    let arrDna = arrValid;
    let qtdLine = arrValid.length;
    let simioFound = []
    let arrColumn = []
    let arrDiagonal1 = []
    let arrDiagonal2 = []
    let statusValid = 0
    let msg = ''
    let countString = 0;

    for (let iLine = 0; iLine < arrDna.length; iLine++) {
        let line = arrDna[iLine]

        if (!validStringDna(line)) {
            msg = 'DNA bad structured. Invalid characters'
            console.log(msg);
            return [[1, msg], simioFound, [], []]
        }

        // valida as string na horizontal
        var booleanValidString = await isStringSimio(line);
        if (booleanValidString) {
            simioFound.push('H >>> ' + line)
        }

        var qtdColumn = line.length;
        if ((countString != 0 && countString != qtdColumn) || qtdLine != qtdColumn) {
            msg = 'DNA bad structured NxN >>> ' + qtdLine + ' x ' + qtdColumn + ' - line ' + line
            console.log(msg)
            statusValid = 1
            return [[1, msg], simioFound, [], []]
        }
        countString = line.length

        // estruturando os dados da horizontal
        var arrLineForColumn = line.split("")
        for (let i = 0; i < arrLineForColumn.length; i++) {
            if (arrColumn.hasOwnProperty(i)) {
                arrColumn[i] = arrColumn[i] + arrLineForColumn[i]
            } else {
                arrColumn[i] = arrLineForColumn[i]
            }
        }

        // estruturando os dados da diagonal linha
        var limitMin = (qtdLine - 3)
        var arrLineForDiagonal = line.split("")
        for (let d = 0; d < limitMin; d++) {
            // primeira diagonal da direita para esquerda percorrendo a primeira linha
            var indexD = iLine + d
            if (arrDiagonal1.hasOwnProperty(d)) {
                arrDiagonal1[d] = arrDiagonal1[d] + ((arrLineForDiagonal.hasOwnProperty(indexD)) ? arrLineForDiagonal[indexD] : '')
            } else {
                arrDiagonal1[d] = arrLineForDiagonal[d]
            }
        }

        // estruturando os dados da diagonal da linha reverse
        var arrDnaReverse = arrLineForDiagonal.reverse()
        var limitMin = (qtdLine - 3)
        for (let d = 0; d < limitMin; d++) {
            // (matriz invertida) segunda diagonal da esquerda para direita percorrendo a primeira linha
            var indexD = iLine + d
            if (arrDiagonal2.hasOwnProperty(d)) {
                arrDiagonal2[d] = arrDiagonal2[d] + ((arrDnaReverse.hasOwnProperty(indexD)) ? arrDnaReverse[indexD] : '')
            } else {
                arrDiagonal2[d] = arrDnaReverse[d]
            }
        }
    }

    // estruturando os dados da diagonal das colunas
    var arrDiagonal3 = []
    var arrDiagonal4 = []
    var limitMin = (qtdLine - 3)
    for (let i = 0; i < arrColumn.length; i++) {
        var arrColumnForDiagonal = arrColumn[i].split("")

        for (let d = 1; d < limitMin; d++) {
            // terceira diagonal da direita para esquerda percorrendo a primeira coluna e descartando o primeiro valor ja existente no arrDiagonal1
            var indexD = i + d
            if (arrDiagonal3.hasOwnProperty(d)) {
                arrDiagonal3[d] = arrDiagonal3[d] + ((arrColumnForDiagonal.hasOwnProperty(indexD)) ? arrColumnForDiagonal[indexD] : '')
            } else {
                arrDiagonal3[d] = arrColumnForDiagonal[d]
            }
        }
    }

    var arrDiagonal4 = []
    var limitMin = (qtdLine - 3)
    var arrColumnReverse = arrColumn.reverse()
    for (let i = 0; i < arrColumnReverse.length; i++) {
        var arrColumnReverseForDiagonal = arrColumnReverse[i].split("")
        for (let d = 1; d < limitMin; d++) {
            // (matriz invertida) quarta diagonal da esquerda para direita percorrendo a ultima coluna descartando o primeiro valor ja existente no arrDiagonal2
            var indexD = i + d
            if (arrDiagonal4.hasOwnProperty(d)) {
                arrDiagonal4[d] = arrDiagonal4[d] + ((arrColumnReverseForDiagonal.hasOwnProperty(indexD)) ? arrColumnReverseForDiagonal[indexD] : '')
            } else {
                arrDiagonal4[d] = arrColumnReverseForDiagonal[d]
            }
        }
    }

    var arrDiagonal = []
    arrDiagonal1 = arrDiagonal1.concat(arrDiagonal2, arrDiagonal3, arrDiagonal4)
    for (let i = 0; i < arrDiagonal1.length; i++) {
        if (arrDiagonal1.hasOwnProperty(i)) {
            arrDiagonal.push(arrDiagonal1[i])
        }
    }

    return [[0, 'OK'], simioFound, arrColumn, arrDiagonal]
}

async function ratioSimios(res = {}) {
    var sql = 'SELECT ' +
        'SUM(IF(issimio = 1, 1, 0)) count_mutant_dna, ' +
        'SUM(IF(issimio = 1, 0, 1)) count_human_dna, ' +
        'COALESCE((SUM(IF(issimio = 1, 1, 0)) / SUM(IF(issimio = 1, 0, 1))), 0) ratio  ' +
        'FROM simio';
    var result = await querySql(sql);
    responseCallback(200, result, res);
    return response
}

function getSqlConnection() {
    return pool.getConnectionAsync().disposer(function (connection) {
        console.log("Releasing connection back to pool")
        connection.release();
    });
}

function querySql(query, params) {
    return Promise.using(getSqlConnection(), function (connection) {
        console.log("Got connection from pool");
        if (typeof params !== 'undefined') {
            return connection.queryAsync(query, params);
        } else {
            return connection.queryAsync(query);
        }
    });
};

async function insertDb(value) {
    const sql = "INSERT INTO simio(simio,issimio,post,hash) VALUES (?, ?, ?, ?)";
    return querySql(sql, value)
}

async function validDnaDb(dna) {
    var hash = crypto.createHash('md5').update(dna.toString()).digest("hex");
    var sql = 'SELECT id, issimio, simio, created_dt FROM simio WHERE hash = ?';
    return querySql(sql, hash)
}

async function isStringSimio(str) {
    return new Promise(function (resolve, reject) {
        var regex = new RegExp(/.*?(?=AAAA)|(?=TTTT)|(?=CCCC)|(?=GGGG)/gm)
        resolve(regex.test(str.toUpperCase()));
    });
}

function validStringDna(str) {
    var regex = new RegExp(/^[ATCG]*$/gm);
    return regex.test(str);
}