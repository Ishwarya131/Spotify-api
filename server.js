const tkt = "BQDrAJTN7I3E3cjD1W-iUXCMukZuHU1vlXCel82OMgC14xXx0JXF-LT7_8GnViQvEPbbE95f7mdaB1bD5GYt6cyBUW8O0X21b5vYnlekYTNJquaI0KCA8sDt60MWtd8xBwAtLB9y2akSS8g_n5fW1cn5cZACPWmRHpE-AZ9zEpxfqoVuI50CWjd-3qCKqlOV8oozjA"
const express = require('express');
const path = require("path");
const bodyParser = require('body-parser');
const request  = require('request');
const axios = require('axios')
app = express();

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    res.render('page', {msg:null});
})

var length = 0;
var level = []
var tkn = "Bearer " + tkt; 
app.post('/',async(req,response)=>{
    var res1,res2,name1,name2,id1,id2;
    console.log(req.body.artist1,req.body.artist2);
    artist2 = req.body.artist2
    await request({url:'https://api.spotify.com/v1/search?q='+req.body.artist1+'&type=artist',headers:{Authorization:tkn}},async(err,res,body)=>{
        if(res) {
            res1 = JSON.parse(res.body);
            console.log(JSON.stringify(res1));
            if(res1.error)
            {
                response.render('page',{msg:"refresh token"})
            }
            name1  = res1.artists.items[0].name;
            id1 = res1.artists.items[0].id;
            console.log(name1);
            console.log(id1);
            await request({url:'https://api.spotify.com/v1/search?q='+artist2+'&type=artist',headers:{Authorization:tkn}},async(err,res,body)=>{
                if(res) {
                    res2 = JSON.parse(res.body);
                    name2  = res2.artists.items[0].name;
                    level[0] = [name2];
                    id2 = res2.artists.items[0].id;
                }
                console.log(name2);
                console.log(id2);

                await request({url:'https://api.spotify.com/v1/artists/'+id2+'/related-artists',headers:{Authorization:tkn}},async (err,res,body)=>{
                    if(res)  {
                        var res3 = JSON.parse(res.body)
                        level[1] = [...res3.artists] 
                        console.log(JSON.stringify(res3));
                        console.log(JSON.stringify(res3.artists));
                        length = await search (name1,1)
                        console.log(length);
                       response.render('page',{msg:`Path distance is ${length}`})
                    }
                })
            })
        }
    })
})
n=0;
async function search (name,i){
  
    if(level[0][0]==name){
        return 0;
    }
    if(i>10)
    {
        return 'greater than 10';
    }
    console.log("outside loop"+i);
    level[i+1] = [];
    for(var j=0;j<level[i].length;j++){
        console.log("level"+JSON.stringify(level[i][j].name));
        console.log(name);
        if(level[i][j].name == name){
            done = true;
            console.log("inside"+i);
            return i;
        }
        
       else{
            await axios.get('https://api.spotify.com/v1/artists/'+level[i][j].id+'/related-artists',{headers:{Authorization:tkn}})
            .then(function (data) {
                console.log(data);

                
                    if(i<10){
                    level[i+1].push.apply(level[i+1], data.artists);}
                    n++;
                    console.log("reqest sent : "+n)
                    
                    if(level[i].length==j+1){
                        
                             search(name,i+1)
                        
                    }
                

              })
              .catch(function(err){
            
                console.log(err)
         
        })
        }
    }    

}

app.listen(process.env.PORT || 5500, function() {
    console.log("server started in port 5500");
})

