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
                // getAllProducts();
                break;
            case "opt2" :
                // checkLowInventory();
                break;            
            case "opt3":
                connection.end();
                break;                    
    
        }

    })
}

start();