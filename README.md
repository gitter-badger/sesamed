[![view on npm](http://img.shields.io/npm/v/handbrake-js.svg)](https://www.npmjs.org/package/handbrake-js)
[![npm module downloads](http://img.shields.io/npm/dt/handbrake-js.svg)](https://www.npmjs.org/package/handbrake-js)
[![Build Status](https://travis-ci.org/redmedical/sesamed.svg?branch=develop)](https://travis-ci.org/redmedical/sesamed)
[![Dependency Status](https://david-dm.org/redmedical/sesamed.svg)](https://david-dm.org/redmedical/sesamed)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)
[![Join the chat at https://gitter.im/redmedcical/sesamed](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/redmedical/sesamed?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# sesamed

Blockchain for the Healthcare System

**Features:**

- private
- Large collection of **test cases** which are maintained and added to
- **GPL-3.0 License** (including ALL dependencies)

Installing
----------

To use in a browser:

```html
<script src="dist/sesamed.min.js" type="text/javascript"></script>
```

To use in [node.js](https://nodejs.org/):

```sh
npm install --save sesamed
```

# API Reference
    Blockchain for the Healthcare System

**Example**  
```js
const sesamed = require("sesamed")
```

* [sesamed](#module_sesamed)
    * _global_
        * [PgpKeys](#PgpKeys) : <code>Object</code>
        * [Account](#Account) : <code>Object</code>
    * _static_
        * [.createAccount(options)](#module_sesamed.createAccount) ⇒ [<code>Account</code>](#Account)
        * [.register(name, publicPgpKey)](#module_sesamed.register) ⇒ <code>Promise</code>

<a name="PgpKeys"></a>

### sesamedPgpKeys : <code>Object</code>
**Kind**: global typedef of [<code>sesamed</code>](#module_sesamed)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| privateKey | <code>String</code> | The digest output of hash function in hex with prepended "0x" |
| publicKey | <code>String</code> | The hash function code for the function used |

<a name="Account"></a>

### sesamedAccount : <code>Object</code>
**Kind**: global typedef of [<code>sesamed</code>](#module_sesamed)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| mnemonic | <code>String</code> | The digest output of hash function in hex with prepended "0x" |
| path | <code>String</code> | The hash function code for the function used |
| privateKey | <code>String</code> | The length of digest |
| address | <code>String</code> | The length of digest |
| pgp | [<code>PgpKeys</code>](#PgpKeys) | The length of digest |

<a name="module_sesamed.createAccount"></a>

### sesamed.createAccount(options) ⇒ [<code>Account</code>](#Account)
creates a new account and sets

**Kind**: static method of [<code>sesamed</code>](#module_sesamed)  
**Returns**: [<code>Account</code>](#Account) - account  
**Params**

- options <code>Object</code>
    - .userIds <code>Object</code>
        - .name <code>String</code> - name connected with pgp keys
        - .email <code>String</code> - email address connected with pgp keys
    - .passphrase <code>String</code> - passphrase to encrypt private pgp key

**Example**  
```js
> sesamed.createAccount()
{
    wallet: {},
    pgp: {}
}
```
<a name="module_sesamed.register"></a>

### sesamed.register(name, publicPgpKey) ⇒ <code>Promise</code>
Registers a new account

**Kind**: static method of [<code>sesamed</code>](#module_sesamed)  
**Params**

- name <code>String</code>
- publicPgpKey <code>String</code>


* * *

&copy; 2019 RED Medical Systems GmbH &lt;info@redmedical.de&gt;. Documented by [jsdoc-to-markdown](https://github.com/75lb/jsdoc-to-markdown).