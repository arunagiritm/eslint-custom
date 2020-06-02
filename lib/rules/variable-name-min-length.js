/**
 * @fileoverview variable length should be greater than 2
 * @author Arun
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "variable length should be greater than 2",
            category: "Best Practices",
            recommended: false
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

            // give me methods
			"VariableDeclarator": (node)=>{
                    if(node.id.name && node.id.name.length < 3){
                        context.report(node,"varible name length should be greater than 2");  
                    } 
			}

        };
    }
};
