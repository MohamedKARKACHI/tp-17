const fs = require('fs');
const convert = require('xml-js');
const protobuf = require('protobufjs');

// Chargement du schéma Protocol Buffers
const root = protobuf.loadSync('employee.proto');
const EmployeeList = root.lookupType('Employees');

// Initialisation de la collection de données
const employees = [];

employees.push({
  id: 1,
  name: 'Ali',
  salary: 9000
});

employees.push({
  id: 2,
  name: 'Kamal',
  salary: 22000
});

employees.push({
  id: 3,
  name: 'Amal',
  salary: 23000
});

// Structure de données principale
let jsonObject = { employee: employees };

// Traitement du format JSON
console.time('JSON encode');
let jsonData = JSON.stringify(jsonObject);
console.timeEnd('JSON encode');

console.time('JSON decode');
let jsonDecoded = JSON.parse(jsonData);
console.timeEnd('JSON decode');

// Traitement du format XML
const options = {
  compact: true,
  ignoreComment: true,
  spaces: 0
};

console.time('XML encode');
let xmlData = "<root>\n" + convert.json2xml(jsonObject, options) + "\n</root>";
console.timeEnd('XML encode');

console.time('XML decode');
let xmlJson = convert.xml2json(xmlData, { compact: true });
let xmlDecoded = JSON.parse(xmlJson);
console.timeEnd('XML decode');

// Traitement du format Protobuf
let errMsg = EmployeeList.verify(jsonObject);
if (errMsg) {
  throw Error(errMsg);
}

console.time('Protobuf encode');
let message = EmployeeList.create(jsonObject);
let buffer = EmployeeList.encode(message).finish();
console.timeEnd('Protobuf encode');

console.time('Protobuf decode');
let decodedMessage = EmployeeList.decode(buffer);
let protoDecoded = EmployeeList.toObject(decodedMessage);
console.timeEnd('Protobuf decode');

// Sauvegarde des résultats
fs.writeFileSync('data.json', jsonData);
fs.writeFileSync('data.xml', xmlData);
fs.writeFileSync('data.proto', buffer);

// Affichage des statistiques
const jsonFileSize = fs.statSync('data.json').size;
const xmlFileSize = fs.statSync('data.xml').size;
const protoFileSize = fs.statSync('data.proto').size;

console.log(`Taille JSON : ${jsonFileSize} octets`);
console.log(`Taille XML  : ${xmlFileSize} octets`);
console.log(`Taille Protobuf: ${protoFileSize} octets`);
