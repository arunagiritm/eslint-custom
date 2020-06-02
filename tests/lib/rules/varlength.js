/**
 * @fileoverview variable lenght should be greater than 2
 * @author Arun
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/varlength"),

    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run("varlength", rule, {

    valid: [

        // give me some code that won't trigger a warning
    ],

    invalid: [
        {
            code: "The variable name should be greater than 2 characters",
            errors: [{
                message: "Fill me in.",
                type: "Me too"
            }]
        }
    ]
});
