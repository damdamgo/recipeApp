/*
module qui donne accés à des fonctions pour simplifier le code
*/
module.exports = {
  sendAnswer: function (res,json) {
    res.send(json);
  },
  sendCategories : function(res,lang,db){
    var jsonSend = new Array();
    db.collection("MainCategories").find({}).toArray(function(err,docs){
      docs.forEach(function(doc){
        var jsonCategory =new Array();
        jsonCategory.push(doc);
        jsonSend.push(jsonCategory);
      });
      db.collection("SubCategories").find({}).toArray(function(err,subdocs){
        subdocs.forEach(function(subdoc){
          for(i=0;i<jsonSend.length;i++){
            if(String(jsonSend[i][0]._id) == String(subdoc.MainCategories_id)){
              jsonSend[i].push(subdoc);
              break;
            }
          }
        });
        res.send(JSON.stringify(jsonSend));
      });
    });
  },
  sendRecipeFromCategories : function(res,db,keysort,sortOrder,idCategorie,borderMin,borderMax){
    db.collection('recipes').aggregate([
    { $match : {"idCategorie":idCategorie }},
    { $sort : {keysort : parseInt(sortOrder)}},
    { $skip : parseInt(borderMin)},
    { $limit : parseInt(borderMax)},
    {
      $lookup :{
        from : "steps",
        localFiel : "_id",
        foreignField : "idRecipe",
        as : "step"
      }
    }
    ],function(err,result){
      console.log(err);
        jsonAnswer = {"code":1,idRecipe:result};
        res.send(jsonAnswer);
    });
  }
}
