var inquire = require("inquirer");
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
        getAllProducts();
        
        connection.end();
       
      });

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

        // create a table with column headings, and column width
        var table = new Table({
            head: ['ID', 'NAME','PRICE','QUANTITY']
          , colWidths: [5,30,10,10]
        });

        // push query results to the table 
        for(var i=0;i<results.length;i++){
            table.push([results[i].item_id,results[i].product_name,results[i].unit_price.toFixed(2),results[i].stock_quantity]);
        }
        console.log(table.toString());        
        console.log("\n\n");
        getOrder();
    });             
} // end getAllProducts


// ****************************************function prompt to order***************************************
function getOrder(){
    inquire.prompt([{
        type:"input",
        name :"itemId",
        message:"Please enter the id of the item to purchase"
    }
    ]).then(answer =>{
        console.log(answer.itemId);
    });
}

// ***********************************************Start the application***********************************
start();
