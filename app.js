const express = require("express");
const app = express();
const mongoose = require("mongoose")
const _ = require("lodash");
const day = require("./date");
//set the view engine to ejs
app.set("view engine", "ejs");

app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))
let port = process.env.PORT;


mongoose.connect("mongodb+srv://yana:6UsHsVLTm8MhnAy9@cluster0.1r7sjtb.mongodb.net/todoDB",function(err){
    if(err){
        console.log(err)
    }
})

const todoListSchema = new mongoose.Schema ({
    name : String
});

const listItem = mongoose.model("item",todoListSchema);

const list1 =  new listItem({
    name : "Buy Food"
})
const list2 = new listItem({
    name : "Cook Food"
})
const list3 = new listItem({
    name : "Eat Food"
})

const defaultList = [list1,list2,list3];
//parm list schema
const paramListSchema = new mongoose.Schema({
    name : String,
    items : []
})
//new table or model or collection

const Items = mongoose.model("itemList",paramListSchema);

app.get('/',(req,res)=>{

    listItem.find({},function(err,result){
        console.log(result)
        if(result.length == 0){
            listItem.insertMany(defaultList,function(err){
                if(err){
                    console.log('error inserting in mongodb')
                }else{
                    console.log('inserted succefully in mongodb')
                }
             })
        }else{
             res.render("todolist",{ listTitle : "Today", listOfItems : result });
        }
        
       
    })

})

app.get("/:customListName",(req,res)=>{
    const customListName = _.capitalize(req.params.customListName)
    
    if (customListName === "Favicon.ico") return;

    Items.findOne({name : customListName},(err,foundItems)=>{
        if(!err){
            if(!foundItems){
                const newItem = new Items({
                    name : customListName,
                    items : []
                })
                newItem.save(function(err){
                    if(err){
                        console.log(err)
                    }else{
                        res.redirect('/'+customListName)
                    }
                })
                
            }
            else{
                res.render("todolist",{listTitle : foundItems.name , listOfItems : foundItems.items })
            }
        }
        
    })

})


app.post('/',(req,res)=>{
    let item = req.body.addTodo;
    const itemTitle = req.body.list

    const newList = new listItem({
        name : item
    });
    if(itemTitle === "Today"){
        newList.save()
        res.redirect("/");
    }else{
        Items.findOne({name : itemTitle},function(err,foundList){
            foundList.items.push(newList)
            foundList.save()
            res.redirect("/"+itemTitle)
        })
    }
    
})

app.post('/delete',(req,res)=>{
    const deleteItem = req.body.checkbox
    const listName = req.body.listName
    
    // console.log(deleteItem)

    if(listName === "Today"){
        listItem.findByIdAndDelete(deleteItem,function(err){
        if(!err){
            console.log("successfully deleted an item")
            res.redirect("/")
        }})
     }else{
        Items.findOne({name : listName},function(err,result){
            if(!err){
              //thank your lord
                Items.findOneAndUpdate({name: listName},{$pull: {items: {_id :mongoose.Types.ObjectId(deleteItem)}}},function(err,result){
                    if(!err){
                        console.log(result)
                        res.redirect("/"+listName)
                    }
                    else{
                        console.log('there is an error deleting item')
                         res.redirect("/"+listName)
                    }
                })
                
               
            }
        })
     }
    
})

if(port == null || port == ""){
    port = 3000;
}
app.listen(port,function(){
    console.log('the server is started successfully');
})