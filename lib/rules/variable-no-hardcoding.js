/**
 * @fileoverview Variable should not be hard coded
 * @author Arun
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "Variable should not be hard coded",
            category: "Best Practices",
            recommended: true
        },
        fixable: null,  // or "code" or "whitespace"
        schema: [
            // fill in your schema
        ]
    },

    create: function(context) {

        // variables should be defined here

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        // any helper functions should go here or else delete this section

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------

        return {

           	"VariableDeclarator": (node)=>{
                if(node.init && node.init.value){
                  if(typeof node.init.value == "string"){
                    context.report(node,"variables should not be Hard coded");  
                  }
                }
			}

        };
    }
};
