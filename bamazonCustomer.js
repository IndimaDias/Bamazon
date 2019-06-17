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
        
        // connection.end();
       
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

    var item_id = 0;
    
    var updateQuery = "UPDATE products SET stock_quantity = ? WHERE item_id = ?";
    var unit_price = 0;
    var stock_quantity = 0;
    var noOfUnits = 0;
    

    inquire.prompt([{
        type:"input",
        name :"itemId",
        message:"Please enter the id of the item to purchase"
    }
    ]).then(answer =>{
        

        item_id=answer.itemId;
        
        var itemQuery = "SELECT stock_quantity,unit_price FROM products WHERE item_id = " + item_id;

        connection.query(itemQuery,function(err,results){
            if(err) throw err;

            unit_price = results[0].unit_price;
            stock_quantity = results[0].stock_quantity;

            
            if(stock_quantity === 0 ){   
               
                console.log("Insufficient quantity!");
                getAllProducts();

            }
            else{
                inquire.prompt([{
                    type:"input",
                    name :"noOfUnits",
                    message:"Please enter the no of units"
                }
            ]).then(answer =>{
                noOfUnits = parseInt(answer.noOfUnits);

                if (noOfUnits > stock_quantity){
                   
                    console.log("Insufficient quantity!");
                    getAllProducts();
                }

                var totalCost = parseFloat(answer.noOfUnits * unit_price);
                var newQuantity = stock_quantity - answer.noOfUnits
                
                connection.query(updateQuery,[newQuantity,item_id],
                              (err,results)=>{
                                  if (err) throw err;

                                  console.log("\nTotal cost :" + totalCost.toFixed(2)+"\n");

                                  getAllProducts();
                              });

            });
            }

            

        }
            )

    });
    // connection.end();
}

// ***********************************************Start the application***********************************
start();
