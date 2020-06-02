/**
 * @fileoverview className should not be used
 * @author Arun
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "className should not be used",
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
			"JSXElement > JSXOpeningElement > JSXAttribute > JSXIdentifier": (node)=>{
                if(node.name == "className"){
                    context.report(node,"Avoid using className. Use Styled-components");  
                  }
			}

        };
    }
};
