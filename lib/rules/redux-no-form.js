/**
 * @fileoverview Avoid using redux-form
 * @author Arun
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "Avoid using redux form",
            category: "Best Practices",
            recommended: true
        },
        fixable: null,  // or "code" or "whitespace"
        schema: [
            // fill in your schema
        ]
    },

    create: function (context) {
        return {
            "ImportDeclaration > Literal": (node) => {
                if (node.value == "redux-form") {
                    context.report(node, "Avoid using redux-form");
                }
            }
        }
    }
};
