/**
 * @fileoverview window.confirm should not be used
 * @author Arun
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "window.confirm should not be used",
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

           	   // give me methods
			"CallExpression > MemberExpression": (node)=>{
                if(node.object && node.property){
                  if(node.object.name == "window" && node.property.name == "confirm"){
                    context.report(node,"window.confirm should not be used");  
                  }
                }
                console.log( node.property.name);
			}

        };
    }
};
