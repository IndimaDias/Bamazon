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

// ***************************************************************************************************************************
function callMenu(){
    var optionList = {
        type : "list",
        name : "optionMenu",
        message : "Select from the menu below",
        choices: [{value: "opt1",
                   name : "View Products sales by department"},
                  {value : "opt2",
                   name : "Create new department"},
                  {value : "opt3",
                   name : "Exit"}],
                   filter: function( val ) {
                    return val;
                  }
    };

    inquirer.prompt(optionList).then(answers=>{
       
        switch (answers.optionMenu){
            case "opt1":
                    salesByDept();
                break;
            case "opt2" :
                createDepartment();
                break;            
            case "opt3":
                connection.end();
                break;                    
    
        }

    })
}
// ********************************function createDepartment*****************************************

function createDepartment(){
    var question = [{
                    type :"input",
                    name :"deptName",
                    message : "Please enter the name of the Department"
                    },
                    {
                     type : "input",
                     name : "overheadCost",
                     message : "Please enter the over head cost"   
                    }
    ];

    inquirer.prompt(question)
       .then(answer =>{

         var department = {department_name : answer.deptName,
                        over_head_cost : answer.overheadCost};

         
        connection.query("INSERT INTO departments SET ?" , department, (err,res)=>{
            if (err) throw err;

            console.log("\nNew Department created \n\n");

            callMenu();
        })                 
    });
}
// ***********************************************function salesByDept*********************************************************
function salesByDept(){
    var querySales = "SELECT p.department_id, d.department_name, d.over_head_cost, SUM(p.product_sales) product_sales,"+
                     "(product_sales - d.over_head_cost) totalProfit "+
                     "FROM  products p, departments d " +
                     "WHERE p.department_id = d.department_id " +
                     "GROUP BY p.department_id";

    // execute select query 
    connection.query(querySales,function(err, results){
        if(err) throw err;
        // console.log(results);

        // create a table with column headings, and column width
        var table = new Table({
            head: ['DEPARTMENT ID', 'NAME','OVER HEAD COST','PRODUCT SALES','TOTAL PROFIT']
          , colWidths: [5,30,20,20,20]
        });

        // push query results to the table 
        for(var i=0;i<results.length;i++){
            table.push([results[i].department_id,results[i].department_name,
                        results[i].over_head_cost.toFixed(2),results[i].product_sales.toFixed(2),
                    results[i].totalProfit.toFixed(2)]);
        }

        // print table to the console
        console.log(table.toString());
        // print to additional lines
        console.log("\n\n");
      
        callMenu();
    });  
}
// *******************************************************************************************************
start();