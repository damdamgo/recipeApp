var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var tool = require('./tool');
var mongoose = require('mongoose');
var User = require('./user');
var Recipe = require('./recipe');
var Step = require('./step');
var busboy = require('connect-busboy');
var bodyParser = require('body-parser');
var fs = require('fs');
var lwip = require('lwip');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.use(busboy());

var url = 'mongodb://localhost:27017/cookstep';
var db;

const APPID_ANDROID = "AJLKJKdsf54454LKLJSDDFjklgsgfs4fd5sdfkNFNDF";

/**
code -1 : erreur de traitement
  error 1 : probleme conformité clé APPID_ANDROID
  error 2 : langue indisponible
  error 3 : probleme de donnees pour la connection
  error 4 : probleme de donnees pour l'inscription
  error 10 : donnees manquante
  error 5 : probleme desauvegarde dans la base de données
  error 6 : data not found
  error 7 : password error
  error 8 : nickname already use
  error 1000 : error
**/

/**
connect to data base
*/
MongoClient.connect(url, function(err, dbase) {
  assert.equal(null, err);
  console.log("Connected correctly to server.");
  db = dbase;
  mongoose.connect(url, function(err) {
    if (err) throw err;
    console.log('Successfully connected to MongoDB');
    init();
  });
});

/**
init function which allow to access request
*/
function init(){

/**
*
*get categories from database
*
*/
  app.get("/:APPID/:LANG/getCategories",function(req,res){
    var jsonAnswer = null;
    if(req.params.APPID==APPID_ANDROID){
      if(req.params.LANG=="EN" || req.params.LANG=="FR"){
        tool.sendCategories(res,req.params.LANG,db);
      }
      else{
        jsonAnswer = {"code":-1,"error":2};
        tool.sendAnswer(res,jsonAnswer);
      }
    }
    else{
      jsonAnswer = {"code":-1,"error":1};
      tool.sendAnswer(res,jsonAnswer);
    }
  });
/**
*
*sign in user
*
*/
  app.post('/:APPID/:LANG/signinUser',function(req,res){
    var jsonAnswer = null;
    if(req.body.nickname && req.body.password){
      User.find({username:req.body.nickname},function(err,user){
        if(err){
          jsonAnswer = {"code":-1,"error":1000};
          tool.sendAnswer(res,jsonAnswer);
        }
        else if(user.length!=0){
            user.comparePassword(req.body.password,function(err,isMatch){
            if(err){
              jsonAnswer = {"code":-1,"error":1000};
              tool.sendAnswer(res,jsonAnswer);
            }
            else{
              if(isMatch){
                jsonAnswer = {"code":1,"idUser":user._id,"status":user.status};
                tool.sendAnswer(res,jsonAnswer);
              }
              else{
                jsonAnswer = {"code":-1,"error":7};
                tool.sendAnswer(res,jsonAnswer);
              }
            }
            });
        }
        else{
          jsonAnswer = {"code":-1,"error":6};
          tool.sendAnswer(res,jsonAnswer);
        }
      })
    }
    else{
      jsonAnswer = {"code":-1,"error":3};
      tool.sendAnswer(res,jsonAnswer);
    }
  });
/**
*
*sign up user
*
*/
  app.post('/:APPID/:LANG/signupUser',function(req,res){
    var jsonAnswer = null;
    if(req.body.nickname && req.body.password){

      User.find({username:req.body.nickname},function(err,user){
        if(err){
          jsonAnswer = {"code":-1,"error":1000};
          tool.sendAnswer(res,jsonAnswer);
        }
        else{
          if(!user.length==0){
            jsonAnswer = {"code":-1,"error":8};
            tool.sendAnswer(res,jsonAnswer);
          }
          else{
            var newUser = new User({
              username: req.body.nickname,
              password: req.body.password,
              status : 1
            });
            newUser.save(function (err, user) {
              if (err) {
                jsonAnswer = {"code":-1,"error":1000};
                tool.sendAnswer(res,jsonAnswer);
              }
              else{
                jsonAnswer = {"code":1,"idUser":user._id,"status":user.status};
                tool.sendAnswer(res,jsonAnswer);
              }
            }); 
          }
        }
      })
    }
    else{
      jsonAnswer = {"code":-1,"error":4};
      tool.sendAnswer(res,jsonAnswer);
    }
  });

  app.post("/:APPID/:LANG/imageUser",function(req,res){
    var user = null;
    var file = null;
    var filename;
    if (req.busboy) {
      req.busboy.on('file', function(fieldname, f, fname, encoding, mimetype){
          file = f;
          filename = fname;
          if(user!=null)user.saveProfilPicture(file,filename,res);
        });
      req.busboy.on('field', function(key, value, keyTruncated, valueTruncated) {
        if(key=="idUser"){
          User.findOne({_id :value },function(err,use){
            if(err){
              jsonAnswer = {"code":-1,"error":1000};
              tool.sendAnswer(res,jsonAnswer);
            }
            else{
              user = use;
              if(file!=null)user.saveProfilPicture(file,filename,res);
            }
          });
        }
      });
      req.pipe(req.busboy);
      }
  });
  /**
  *
  *create or change recipe
  *
  */
  app.post('/:APPID/:LANG/saveRecipe',function(req,res){
    if(req.body.jsonRecipe){
      var json = JSON.parse(req.body.jsonRecipe);
      console.log(json);
      if(json.hasOwnProperty('id')){
          Recipe.findOne({_id :json.id },function(err,reci){
            if(err){
              jsonAnswer = {"code":-1,"error":1000};
              tool.sendAnswer(res,jsonAnswer);
            }
            else{
              reci.updateRecipe(json,res);
            }
          });
      }
      else{
        var newRecipe = new Recipe({
          name: json.name,
          ingredients : json.ingredients,
          tricks:json.tricks,
          source : json.source,
          country : json.country,
          time : json.time,
          creationDate : new Date(),
          modificationDate : new Date(),
          StepNumber : json.nbStep,
          idCategorie : json.idCategorie,
          autho : false
        });
        newRecipe.save(function(err,recipe){
          if(err){
            jsonAnswer = {"code":-1,"error":1000};
            tool.sendAnswer(res,jsonAnswer);
          }
          else{
            jsonAnswer = {"code":1,"idRecipe":recipe._id};
            tool.sendAnswer(res,jsonAnswer);
          }
        });
      }
    }
    else{
      jsonAnswer = {"code":-1,"error":10};
      tool.sendAnswer(res,jsonAnswer);
    }
  });
/**
*
*save step
*
*/
  app.post('/:APPID/:LANG/saveStep',function(req,res){
    if(req.body.jsonStep){
      var json = JSON.parse(req.body.jsonStep);
      console.log(json);
      if(json.hasOwnProperty('id')){
          Step.findOne({_id :json.id },function(err,step){
            if(err){
              jsonAnswer = {"code":-1,"error":1000};
              tool.sendAnswer(res,jsonAnswer);
            }
            else{
              step.updateStep(json,res);
            }
          });
      }
      else{
        var newStep = new Step({
          tricks : json.tricks,
          idRecipe : json.idRecipe,
          indexStep : json.indexStep,
          stepText : json.stepText
        });
        newStep.save(function(err,step){
          if(err){
            jsonAnswer = {"code":-1,"error":1000};
            tool.sendAnswer(res,jsonAnswer);
          }
          else{
            jsonAnswer = {"code":1,"idStep":step._id};
            tool.sendAnswer(res,jsonAnswer);
          }
        });
      }
    }
    else{
      jsonAnswer = {"code":-1,"error":10};
      tool.sendAnswer(res,jsonAnswer);
    }
  });
/**
*
* save Main recipe picture
*
*/
  app.post("/:APPID/:LANG/saveRecipePicture",function(req,res){
    var recipe = null;
    var file = null;
    var filename;
    if (req.busboy) {
      req.busboy.on('file', function(fieldname, f, fname, encoding, mimetype){
          file = f;
          filename = fname;
          if(recipe!=null)recipe.savePicture(file,filename,res);
        });
      req.busboy.on('field', function(key, value, keyTruncated, valueTruncated) {
        if(key=="idRecipe"){
          Recipe.findOne({_id :value },function(err,reci){
            if(err){
              jsonAnswer = {"code":-1,"error":1000};
              tool.sendAnswer(res,jsonAnswer);
            }
            else{
              recipe = reci;
              if(file!=null)recipe.savePicture(file,filename,res);
            }
          });
        }
      });
      req.pipe(req.busboy);
      }
  });
/**
*
*save step picture
*
*/
  app.post("/:APPID/:LANG/saveStepPicture",function(req,res){
    var step = null;
    var file = null;
    var filename;
    if (req.busboy) {
      req.busboy.on('file', function(fieldname, f, fname, encoding, mimetype){
          file = f;
          filename = fname;
          if(step!=null)step.savePicture(file,filename,res);
        });
      req.busboy.on('field', function(key, value, keyTruncated, valueTruncated) {
        if(key=="idStep"){
          Step.findOne({_id :value },function(err,ste){
            if(err){
              jsonAnswer = {"code":-1,"error":1000};
              tool.sendAnswer(res,jsonAnswer);
            }
            else{
              step = ste;
              if(file!=null)step.savePicture(file,filename,res);
            }
          });
        }
      });
      req.pipe(req.busboy);
      }
  });
/**
*
*
*
*/
  app.post("/:APPID/:LANG/getRecipeFromCategory",function(req,res){
    var jsonAnswer = null;
    console.log(req.params);
    if(req.params.APPID==APPID_ANDROID){
      if(req.params.LANG=="EN" || req.params.LANG=="FR"){
        if(req.body.idCategorie && req.body.borderMin && req.body.borderMax){
            if(req.body.keySort){
              if(req.body.sortOrder){
                tool.sendRecipeFromCategories(res,db,req.body.keySort,req.body.sortOrder,req.body.idCategorie,req.body.borderMin,req.body.borderMax);
              }
              else{
                tool.sendRecipeFromCategories(res,db,req.body.keySort,1,req.body.idCategorie,req.body.borderMin,req.body.borderMax);
              }
            } 
            else{
              tool.sendRecipeFromCategories(res,db,"creationDate",1,req.body.idCategorie,req.body.borderMin,req.body.borderMax);
            }
        }
        else{
          jsonAnswer = {"code":-1,"error":10};
          tool.sendAnswer(res,jsonAnswer);
        }
      }
      else{
        jsonAnswer = {"code":-1,"error":2};
        tool.sendAnswer(res,jsonAnswer);
      }
    }
    else{
      jsonAnswer = {"code":-1,"error":1};
      tool.sendAnswer(res,jsonAnswer);
    }
  });
/**
*
*start app
*
*/
  app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
  });
}
