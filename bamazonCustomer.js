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

  
function getAllProducts(){
    var queryProducts = "SELECT * " +
                 "FROM Products ";

    connection.query(queryProducts,function(err, results){
        if(err) throw err;
        // console.log(results);

        var table = new Table({
            head: ['ID', 'NAME','PRICE','QUANTITY']
          , colWidths: [5,30,10,10]
        });

        for(var i=0;i<results.length;i++){
            table.push([results[i].item_id,results[i].product_name,results[i].unit_price,results[i].stock_quantity]);
        }
        console.log(table.toString());        
    });             
}
  
start();
