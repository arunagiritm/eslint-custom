# eslint-plugin-verizon-mva-plugin-1-0

Custom lint rules for verizon mva

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-verizon-mva-plugin-1-0`:

```
$ npm install eslint-plugin-verizon-mva-plugin-1-0 --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-verizon-mva-plugin-1-0` globally.

## Usage

Add `verizon-mva-plugin-1-0` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "verizon-mva-plugin-1-0"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "verizon-mva-plugin-1-0/rule-name": 2
    }
}
```

## Supported Rules

* Fill in provided rules here





