var method = Functions.prototype;

var formidable = require("formidable");
var moby = require('moby')





function Functions(){}
/* This function check

s string's compatibilty for mysql query */







method.querysearch=function(req, res){
    var searchword = "";
    var form = new formidable.IncomingForm();
    var word1 = "";
    var word2 = "";
    var word3 = "";
    var word4 = "";
    try{
        form.parse(req, function (err, fields, files) {
            word1 = fields.word1;
			word1_synonyms = moby.search(fields.word1);
			word2 = fields.word2;
			word2_synonyms = moby.search(fields.word2);
			word3 = fields.word3;
			word3_synonyms = moby.search(fields.word3);
			word4 = fields.word4;
			word4_synonyms = moby.search(fields.word4);



               res.send({ word1_synonyms: [escape(word1),word1_synonyms],word2_synonyms: [escape(word2),word2_synonyms],word3_synonyms: [escape(word3),word3_synonyms],word4_synonyms: [escape(word4),word4_synonyms]});


           



        });

    } catch (ex) {
    res.render('contentpage.html',{searchword:escape(searchword),wordmeaning:"",wikisummary1:escape(""),wikisummary2:escape(""),wikisummary3:escape("")}); 

    }

} // function finishes







/* This function use wikipedia api to get word summary*/
method.wikipediasummary=function(searchword, res) {
   
    var wikisummary1="";
    var wikisummary2="";
    var wikisummary3="";



    try{
      
         
     
            const https = require('https');

        https.get('https://en.wikipedia.org/w/api.php?action=query&titles=' + escape(searchword) + '&prop=extracts&redirects&exintro=&explaintext&format=json', (result) => {


                var responsedata="";
                result.on('data', function(chunk){
                    responsedata+=chunk;


                });

                result.on('end', function () {

                    var jsonobject=JSON.parse(responsedata);

                    for (key in jsonobject.query.pages) {


                        var value = jsonobject.query.pages[key].extract.split(".");
                        try{
                            if(value[0]){
                                wikisummary1=value[0];
                            }
                        }catch(ex){}
                        try{
                            if(value[1]){
                                wikisummary2=value[1];
                            }
                        }catch(ex){}
                        try{
                            if(value[2]){
                                wikisummary3=value[2];
                            }
                        }catch(ex){}
                        method.oxforddictionary(searchword, jsonobject.query.pages[key].title, [wikisummary1, wikisummary2, wikisummary3], res);




                    }
  

                });


            }).on('error', (e) => {

                res.render('contentpage.html', { searchword: escape(searchword), wordmeaning: "", wikisummary1: escape(wikisummary1), wikisummary2: escape(wikisummary2), wikisummary3: escape(wikisummary3) });
 

            });




      
    
    }catch(ex){
        res.render('contentpage.html', { searchword: escape(searchword), wordmeaning: "", wikisummary1: escape(wikisummary1), wikisummary2: escape(wikisummary2), wikisummary3: escape(wikisummary3) });
 
    }

}


/* This function use oxforddictionary api to get word meaning*/
method.oxforddictionary=function(searchword,wikicorrectword,wikisummary,responsepage){
    var wordmeaning="";

    try{
        var options = {
            host :  'od-api.oxforddictionaries.com',
            port : 443,
            path : '/api/v1/entries/en/'+escape(wikicorrectword),
            method : 'GET',
            headers : {
                "Accept": "application/json",
                "app_id": '1d13be4b',
                "app_key": '30bf777370cf37a4ed30eac37fe7e419'
            }
        };

 
        require("https").get(options, function(res) {




            var responsejsonstring="";


            if(res.statusCode == 404){
      
                responsepage.render('contentpage.html',{searchword:escape(searchword),wordmeaning:escape(wordmeaning),wikisummary1:escape(wikisummary[0]),wikisummary2:escape(wikisummary[1]),wikisummary3:escape(wikisummary[2])}); 
            
            }else{

                var data = "";
                res.on('data', function(chunk) {

                    responsejsonstring+=chunk;
             
                })
                .on('end',function(){

                    try {

                        var result = JSON.parse(responsejsonstring);

                        if(result.results[0].lexicalEntries[0].entries[0].senses[0].definitions["0"]){
                            wordmeaning=result.results[0].lexicalEntries[0].entries[0].senses[0].definitions["0"];
                        }
                        
                        method.insertnewentrytodatabase(searchword, wikisummary[0] + "." + wikisummary[1] + wikisummary[2], wordmeaning);
                        responsepage.render('contentpage.html',{searchword:escape(searchword),wordmeaning:escape(wordmeaning),wikisummary1:escape(wikisummary[0]),wikisummary2:escape(wikisummary[1]),wikisummary3:escape(wikisummary[2])}); 


                    } catch (exp) {

                        responsepage.render('contentpage.html',{searchword:escape(searchword),wordmeaning:escape(wordmeaning),wikisummary1:escape(wikisummary[0]),wikisummary2:escape(wikisummary[1]),wikisummary3:escape(wikisummary[2])}); 


                    }

           
                })
                .on('error',function(err){
                    responsepage.render('contentpage.html',{searchword:escape(searchword),wordmeaning:escape(wordmeaning),wikisummary1:escape(wikisummary[0]),wikisummary2:escape(wikisummary[1]),wikisummary3:escape(wikisummary[2])}); 

             
                });
            }
        
        });
    }catch(ex){
        responsepage.render('contentpage.html',{searchword:escape(searchword),wordmeaning:escape(wordmeaning),wikisummary1:escape(wikisummary[0]),wikisummary2:escape(wikisummary[1]),wikisummary3:escape(wikisummary[2])}); 
    }
 
}

module.exports = Functions;
