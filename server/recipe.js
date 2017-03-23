var mongoose = require('mongoose'),
Schema = mongoose.Schema;
var fs = require('fs');
var tool = require('./tool');
var lwip = require('lwip');

var RecipeSchema = new Schema({
	name: { type: String},
	mainPicture: { type:String},
	ingredients : {type :Array},
	tricks:{type:Array},
	source : {type:String},
	country : {type : String},
	time : {type:String},
	id_user : {type:String},
	comments : {type:Array},
	creationDate : {type:Date},
	modificationDate : {type:Date},
	StepNumber : {type : Number},
	idCategorie : {type:String},
	autho : {type:Boolean}
});

RecipeSchema.methods.savePicture = function(file, filename,res){
	if(this.mainPicture!=null){
		fs.unlink(__dirname + '/imagesRecipe/thumbail/' +this.mainPicture);
		fs.unlink(__dirname + '/imagesRecipe/small/' +this.mainPicture);
		fs.unlink(__dirname + '/imagesRecipe/medium/' +this.mainPicture);
		fs.unlink(__dirname + '/imagesRecipe/large/' +this.mainPicture);
	}
	var ext = filename.split("\.");
	var nameRecipe = this._id + Date.now() +"."+ ext[ext.length-1] ;
	var rec = this;
	fstream = fs.createWriteStream(__dirname + '/imagesRecipe/' + nameRecipe);
	file.pipe(fstream);
	fstream.on('close', function () {
		jsonAnswer = {"code":1};
		tool.sendAnswer(res,jsonAnswer);
		rec.mainPicture=nameRecipe;
		rec.save();
		fstreamThumbail = fs.createReadStream(__dirname + '/imagesRecipe/' + nameRecipe );
		fstreamThumbail.on('close',function(){
			lwip.open(__dirname + '/imagesRecipe/thumbail/' +nameRecipe, function(err, image){
				ratio = Math.round((image.height()*100)/image.width());
				image.resize(100,ratio, function(err,image){
					image.writeFile(__dirname + '/imagesRecipe/thumbail/' +nameRecipe,function(err, buffer){
					});
				});
			});
		});
		fstreamThumbail.pipe(fs.createWriteStream(__dirname + '/imagesRecipe/thumbail/' +nameRecipe));

		ffstreamSmall = fs.createReadStream(__dirname + '/imagesRecipe/' + nameRecipe);
		ffstreamSmall.on('close',function(){
			lwip.open(__dirname + '/imagesRecipe/small/' +nameRecipe, function(err, image){
				ratio = Math.round((image.height()*240)/image.width());
				image.resize(240,ratio, function(err,image){
					image.writeFile(__dirname + '/imagesRecipe/small/' +nameRecipe,function(err, buffer){
					});
				});
			});
		});
		ffstreamSmall.pipe(fs.createWriteStream(__dirname + '/imagesRecipe/small/' +nameRecipe));

		fstreamMedium = fs.createReadStream(__dirname + '/imagesRecipe/' + nameRecipe);
		fstreamMedium.on('close',function(){
			lwip.open(__dirname + '/imagesRecipe/medium/' +nameRecipe, function(err, image){
				ratio = Math.round((image.height()*460)/image.width());
				image.resize(460,ratio, function(err,image){
					image.writeFile(__dirname + '/imagesRecipe/medium/' +nameRecipe,function(err, buffer){
					});
				});
			});
		});
		fstreamMedium.pipe(fs.createWriteStream(__dirname + '/imagesRecipe/medium/' +nameRecipe));

		fstreamLarge = fs.createReadStream(__dirname + '/imagesRecipe/' + nameRecipe);
		fstreamLarge.on('close',function(){
			lwip.open(__dirname + '/imagesRecipe/large/' +nameRecipe, function(err, image){
				ratio = Math.round((image.height()*640)/image.width());
				image.resize(640,ratio, function(err,image){
					image.writeFile(__dirname + '/imagesRecipe/large/' +nameRecipe,function(err, buffer){
					});
				});
			});
		});
		fstreamLarge.pipe(fs.createWriteStream(__dirname + '/imagesRecipe/large/' +nameRecipe));

	});

};

RecipeSchema.methods.updateRecipe = function(json,res){
	if(json.hasOwnProperty('name'))this.name=json.name;
	if(json.hasOwnProperty('ingredients'))this.ingredients=json.ingredients;
	if(json.hasOwnProperty('tricks'))this.tricks=json.tricks;
	if(json.hasOwnProperty('source'))this.source=json.source;
	if(json.hasOwnProperty('country'))this.country=json.country;
	if(json.hasOwnProperty('time'))this.time=json.time;
	if(json.hasOwnProperty('StepNumber'))this.StepNumber=json.StepNumber;
	if(json.hasOwnProperty('idCategorie'))this.idCategorie=json.idCategorie;	
	this.modificationDate = new Date();
	this.save();
	jsonAnswer = {"code":1,idRecipe:this._id};
    tool.sendAnswer(res,jsonAnswer);
};


module.exports = mongoose.model('Recipe', RecipeSchema);