const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const _ = require("lodash");
const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/todolistDB' , {useNewURLparser : true}) ;

const itemSchema  = new mongoose.Schema({
    name: String, 
   });

   const Item = mongoose.model('Item', itemSchema); 

   const item1 = new Item({
    name: "WELCOME to to do list",
   })
   const item2 = new Item({
    name: "click + to add item in list",
   })
   const item3 = new Item({
    name: "Check to drop items in list",
   })


   const defaultItems = [item1, item2, item3];


   const listSchema  = new mongoose.Schema({
    name: String, 
    items: [itemSchema],
   });

   const List = mongoose.model('List', listSchema); 


 
app.get("/", function(req, res){
 Item.find({}, function(err, foundItems){
   
  if(foundItems.length === 0){
    Item.insertMany(defaultItems, function(err){
        if(err){
            console.log("err");
        }
        else{
            console.log("good to go");
        }
res.redirect("/");

       });

  }
     else{
    Item.find({}, function(err, foundItems){
        res.render("to_do_list", { kindOfDay: "Today", newitem:foundItems });

    })
}  
});
  
});


app.get("/:newRoute", function(req, res){
    const customList = _.capitalize(req.params.newRoute);
    
    const list = new List({
        name: customList,
        items: defaultItems,
    });

    list.save();

    List.findOne({name:customList}, function(err, foundList){
       if(!err){
        if(!foundList){
            const list = new List({
                name: customList,
                items: defaultItems,
            });
        
            list.save();
            res.redirect("/"+ customList);
        }
        else{
            res.render("to_do_list", { kindOfDay: foundList.name, newitem:foundList.items });

        }
       }

    })

})


app.post("/", function(req, res){
    let nayaItem = req.body.nice;
    const listName = req.body.list;
  
   const item  = new Item({
     name:  nayaItem,
   });

   if(listName === "Today"){
    item.save();
    res.redirect("/"); 
   }
   else{
    List.findOne({name: listName}, function(err, foundList){

        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+ listName);
    })
   }
     
  
 });
 
 
 app.post("/delete", function(req, res){
      
      const  checkedID = req.body.checkBox;
      const listCheck = req.body.listBkl;

      if(listCheck === "Today"){
        Item.findByIdAndRemove(checkedID, function(err){
            if(err){
                console.log(err) 
                    }
                   
         })
         res.redirect("/");
      }
       else{
        List.findOneAndUpdate({name: listCheck}, {$pull: {items:{_id: checkedID}}}, function(err, foundList){
            if(!err){
                res.redirect("/"+ listCheck);
            }
        })
       }
      
 })

app.listen(1200, function(){

}) 