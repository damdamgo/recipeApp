var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10;
var tool = require('./tool');
var lwip = require('lwip');
var fs = require('fs');
/**
*Status :
* 1 : admin
* 2 : moderator
* 3 : creator
* 4 : user
*/
var UserSchema = new Schema({
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    status:{type:Number},
    profilPicture : {type:String}//date creation, photo, datederniere connexion,admin boolean,creator bollean,mail
});

UserSchema.pre('save', function(next){ 
	var user = this;
	// only hash the password if it has been modified (or is new)
	if (!user.isModified('password')) return next();

	// generate a salt
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
	    if (err) return next(err);

	    // hash the password along with our new salt
	    bcrypt.hash(user.password, salt, function(err, hash) {
	        if (err) return next(err);

	        // override the cleartext password with the hashed one
	        user.password = hash;
	        next();
	    });
	});
});


UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};


UserSchema.methods.saveProfilPicture = function(file, filename,res){
	if(this.profilPicture!=null){
		fs.unlink(__dirname + '/imagesUser/thumbail/' +this.profilPicture);
		fs.unlink(__dirname + '/imagesUser/small/' +this.profilPicture);
		fs.unlink(__dirname + '/imagesUser/medium/' +this.profilPicture);
		fs.unlink(__dirname + '/imagesUser/large/' +this.profilPicture);
	}
	var ext = filename.split("\.");
	var namePicture = this._id + Date.now() +"."+ ext[ext.length-1] ;
	var use = this;
	fstream = fs.createWriteStream(__dirname + '/imagesUser/' + namePicture);
	file.pipe(fstream);
	fstream.on('close', function () {
		jsonAnswer = {"code":1};
		tool.sendAnswer(res,jsonAnswer);
		use.profilPicture=namePicture;
		use.save();
		fstreamThumbail = fs.createReadStream(__dirname + '/imagesUser/' + namePicture );
		fstreamThumbail.on('close',function(){
			lwip.open(__dirname + '/imagesUser/thumbail/' +namePicture, function(err, image){
				ratio = Math.round((image.height()*100)/image.width());
				image.resize(100,ratio, function(err,image){
					image.writeFile(__dirname + '/imagesUser/thumbail/' +namePicture,function(err, buffer){
					});
				});
			});
		});
		fstreamThumbail.pipe(fs.createWriteStream(__dirname + '/imagesUser/thumbail/' +namePicture));

		ffstreamSmall = fs.createReadStream(__dirname + '/imagesUser/' + namePicture);
		ffstreamSmall.on('close',function(){
			lwip.open(__dirname + '/imagesUser/small/' +namePicture, function(err, image){
				ratio = Math.round((image.height()*240)/image.width());
				image.resize(240,ratio, function(err,image){
					image.writeFile(__dirname + '/imagesUser/small/' +namePicture,function(err, buffer){
					});
				});
			});
		});
		ffstreamSmall.pipe(fs.createWriteStream(__dirname + '/imagesUser/small/' +namePicture));

		fstreamMedium = fs.createReadStream(__dirname + '/imagesUser/' + namePicture);
		fstreamMedium.on('close',function(){
			lwip.open(__dirname + '/imagesUser/medium/' +namePicture, function(err, image){
				ratio = Math.round((image.height()*460)/image.width());
				image.resize(460,ratio, function(err,image){
					image.writeFile(__dirname + '/imagesUser/medium/' +namePicture,function(err, buffer){
					});
				});
			});
		});
		fstreamMedium.pipe(fs.createWriteStream(__dirname + '/imagesUser/medium/' +namePicture));

		fstreamLarge = fs.createReadStream(__dirname + '/imagesUser/' + namePicture);
		fstreamLarge.on('close',function(){
			lwip.open(__dirname + '/imagesUser/large/' +namePicture, function(err, image){
				ratio = Math.round((image.height()*640)/image.width());
				image.resize(640,ratio, function(err,image){
					image.writeFile(__dirname + '/imagesUser/large/' +namePicture,function(err, buffer){
					});
				});
			});
		});
		fstreamLarge.pipe(fs.createWriteStream(__dirname + '/imagesUser/large/' +namePicture));

	});

}

module.exports = mongoose.model('User', UserSchema);