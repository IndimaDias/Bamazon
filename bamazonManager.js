var inquirer = require("inquirer");
var mysql = require("mysql");
var Table = require("cli-table");

var connection = mysql.createConnection({
    host : "localhost",
    port : 3306,
    user : "root",
    password : "unhdb1",
    database : "bamazon"    
});

function start(){
    connection.connect(function(err) {
        if (err) throw err;
        console.log("connected as id " + connection.threadId + "\n");
        callMenu();
        
        // connection.end();
       
      });

}

// *************************************funtion callMenu***********************************************
function callMenu(){
    var optionList = {
        type : "list",
        name : "optionMenu",
        message : "Select from the menu below",
        choices: [{value: "opt1",
                   name : "View Products for Sale"},
                  {value : "opt2",
                   name : "View Low Inventory"},
                  {value : "opt3",
                   name : "Add to Inventory"},
                  {value : "opt4",
                   name : "Add New Product"},
                  {value : "opt5",
                   name : "Exit"}],
                   filter: function( val ) {
                    return val;
                  }
    };

    inquirer.prompt(optionList).then(answers=>{
       
        switch (answers.optionMenu){
            case "opt1":
                getAllProducts();
                break;
            case "opt2" :
                checkLowInventory();
                break;
            case "opt3":
                addToInventory();    
                break;
            case "opt4":
                addNewProduct();
                break;
            case "opt5":
                connection.end();
                break;        
    
        }

    })
}

// **************************************function get all products**************************************
// This function query all  products from the database and list as a table

function getAllProducts(){

    // define select query
    var queryProducts = "SELECT * " +
                 "FROM Products ";

    // execute select query 
    connection.query(queryProducts,function(err, results){
        if(err) throw err;
        // console.log(results);

        
       console.log("\n************************** Items for Sale **************************\n\n");

        // call function to print table with results 
        listTable(results);

        // call function to display the menu
        callMenu();
        
    });             
} // end getAllProducts

// *******************************************function checkLowInventory********************************

function checkLowInventory(){
    var queryStocks = "SELECT * FROM products WHERE stock_quantity < 5";

    connection.query(queryStocks,function(err,results){
        if(err) throw err;

        console.log("\n************************* Items with low Inventory *****************************");
        listTable(results);
        callMenu();
    });
}

// *********************************************function listTable**************************************

function listTable(dataSet){
    // this function will create a table with the give array of data 

    // create a table with column headings, and column width
    var table = new Table({
        head: ['ID', 'NAME','PRICE','QUANTITY']
      , colWidths: [5,30,10,10]
    });

// // push query results to the table 
    for(var i=0;i<dataSet.length;i++){
        table.push([dataSet[i].item_id,dataSet[i].product_name,dataSet[i].unit_price.toFixed(2),dataSet[i].stock_quantity]);
    }

    // print the table with data
    console.log(table.toString());        
        console.log("\n\n");
}

// ***************************************function addToInventory*****************************************
function addToInventory(){

   

    var item_id = 0;
    
    var updateQuery = "UPDATE products SET stock_quantity = ? WHERE item_id = ?";
    
    var unit_price = 0;
    var stock_quantity = 0;
    var noOfUnits = 0;
    
    

    inquirer.prompt([{
        type:"input",
        name :"itemId",
        message:"Please enter the id of the item"
    },
    {
        type:"input",
        name :"noOfUnits",
        message:"Please enter the no of units"
    }
    ]).then(answer =>{
        
        item_id = answer.itemId;
        var selectQuery = "SELECT stock_quantity FROM products WHERE item_id = " + item_id;  
        
               
        connection.query(selectQuery,function(err, results){
            if(err) throw err;
            stock_quantity = results[0].stock_quantity + parseInt(answer.noOfUnits);


            connection.query(updateQuery,[stock_quantity,item_id],
                (err,results)=>{
                    if (err) throw err;

                    console.log("\nItem inventory updated\n\n");

                   callMenu();
                });
        })


                       

        }
            )

}

// *********************************function addNewProduct***********************************************
function addNewProduct(){
    var question = [{
                    type :"input",
                    name :"productName",
                    message : "Please enter the name of the product"
                    },
                    {
                     type : "input",
                     name : "department_name",
                     message : "Please enter the department name"   
                    },
                    {
                     type : "input",
                     name : "unitPrice",
                     message : "Plaease enter the item price"
                    },
                    {
                     type : "input",
                     name : "quantity",
                     message : "Please enter the no of units available"   
                    }
    ];

    inquirer.prompt(question)
       .then(answer =>{

         var product = {product_name : answer.productName,
                        department_name : answer.department_name,
                        unit_price : answer.unitPrice,
                        stock_quantity : answer.quantity};

         
        connection.query("INSERT INTO products SET ?" , product, (err,res)=>{
            if (err) throw err;

            console.log("\nNew item added\n\n");

            callMenu();
        })                 
    });
}
// ******************************************************************************************************
start();