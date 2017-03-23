/**
permet d'initialiser la bdd
*/
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var url = 'mongodb://localhost:27017/cookstep';
var db;

MongoClient.connect(url, function(err, dbase) {
  assert.equal(null, err);
  console.log("Connected correctly to server.");
  db = dbase;
  dropTable();
});

function dropTable(){
  /*db.collection('recipes').drop(function(err,res){
    db.collection('users').drop(function(err,res){
      db.collection('MainCategories').drop(function(err,res){
        db.collection('SubCategories').drop(function(err,res){
          insertTable();
        });
      });
    });
  });*/
  insertTable();
}

function insertTable(){
  db.collection('MainCategories').insertMany([{
    "FR" : "entrée froide",
    "EN" : "",
    "COLOR":"#2196f3"
  },
  {
    "FR" : "entrée chaude",
    "EN" : "",
    "COLOR":"#3f51b5"
  },{
    "FR" : "plat",
    "EN" : "",
    "COLOR":"#F44336"
  },
  {"FR" : "dessert",
  "EN":"",
  "COLOR":"#F44336"
}]
,function(err,res){
  assert.equal(null, err);
  db.collection("SubCategories").insertMany([{
    MainCategories_id : res.insertedIds[0],
    "FR" : "apéro",
    "EN":""
  },{
    MainCategories_id : res.insertedIds[0],
    "FR" : "cake salé",
    "EN" : ""
  },{
    MainCategories_id : res.insertedIds[0],
    "FR" : "salade",
    "EN" : ""
  },{
    MainCategories_id : res.insertedIds[1],
    "FR":"tarte salée",
    "EN":""
  },{
    MainCategories_id : res.insertedIds[1],
    "FR" :"soupe",
    "EN":""
  },{
    MainCategories_id : res.insertedIds[2],
    "FR":"crustacé",
    "EN":""
  },{
    MainCategories_id : res.insertedIds[2],
    "FR":"poisson",
    "EN":""
  },{
    MainCategories_id : res.insertedIds[2],
    "FR": "gibier",
    "EN":""
  },{
    MainCategories_id : res.insertedIds[2],
    "FR":"volaille",
    "EN":""
  },{
    MainCategories_id : res.insertedIds[2],
    "FR":"porc",
    "EN":""
  },{
    MainCategories_id : res.insertedIds[2],
    "FR":"boeuf",
    "EN":""
  },{
    MainCategories_id : res.insertedIds[2],
    "FR":"mouton",
    "EN":""
  },{
    MainCategories_id : res.insertedIds[2],
    "FR":"accompagnement",
    "EN":""
  },{
    MainCategories_id : res.insertedIds[3],
    "FR":"gâteau",
    "EN":""
  },{
    MainCategories_id : res.insertedIds[3],
    "FR":"tarte",
    "EN":""
  },{
    MainCategories_id : res.insertedIds[3],
    "FR":"entremet",
    "EN":""
  },{
    MainCategories_id : res.insertedIds[3],
    "FR":"glace/sorbet",
    "EN":""
  }],function(err,res){
    assert.equal(null, err);
    db.close();
  })
});
}
