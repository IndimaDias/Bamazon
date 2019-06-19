// import npm inquirer package
var inquire = require("inquirer");
// import npm mysql package
var mysql = require("mysql");
// import npm cli-table package
var Table = require("cli-table");

// create connection to mysql database
var connection = mysql.createConnection({
    host : "localhost",
    port : 3306,
    user : "root",
    password : "unhdb1",
    database : "bamazon"    
});

// ************************************function start************************************************
function start(){
    // when this function is called the application will connect to the database
    connection.connect(function(err) {
        if (err) throw err;
        console.log("connected as id " + connection.threadId + "\n");

        // call getAllProducts to list data
        getAllProducts();
                
       
      });

}// end function start 

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

        // print table to the console
        console.log(table.toString());
        // print to additional lines
        console.log("\n\n");
        // call function to get customer orders
        getOrder();
    });             
} // end getAllProducts


// ****************************************function prompt to order***************************************
function getOrder(){

    // This function requests order details from the user, using the npm inquirer package 
    // variable to hold the item id
    var item_id = 0;
    // update query to update stock when order is placed
    var updateQuery = "UPDATE products SET stock_quantity = ?, product_sales =? WHERE item_id = ?";
    // variable to hold the unit price
    var unit_price = 0;
    // variable to hold the stock quantity 
    var stock_quantity = 0;
    // variable to hold the no of units that customer is purchasing 
    var noOfUnits = 0;
    // variable to hold the product sales amount
    var product_sales = 0;

    // prompt user to enter an order
    inquire.prompt([{
        type:"input",
        name :"itemId",
        message:"Please enter the id of the item to purchase"
    }
    ]).then(answer =>{
        

        item_id=answer.itemId;
        
        var itemQuery = "SELECT stock_quantity,unit_price, product_sales FROM products WHERE item_id = " + item_id;

        connection.query(itemQuery,function(err,results){
            if(err) throw err;

            unit_price = results[0].unit_price;
            stock_quantity = results[0].stock_quantity;
            product_sales = results[0].product_sales;

            // if stock not availabel 
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
                //    if availble stocks less than the amount that the customer wants to buy
                    console.log("Insufficient quantity!");
                    getAllProducts();
                }

                var totalCost = parseFloat(answer.noOfUnits * unit_price);
                var newQuantity = stock_quantity - answer.noOfUnits
                var newSales = product_sales + totalCost;
                
                connection.query(updateQuery,[newQuantity,newSales,item_id],
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
