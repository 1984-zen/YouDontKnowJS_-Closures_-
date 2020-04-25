# 你所不知道的JS
* [You Dont Know JS 1st 原文版](https://github.com/getify/You-Dont-Know-JS/blob/1st-ed/scope%20%26%20closures/ch2.md)
* [You Dont Know JS 1st 簡中版](https://github.com/getify/You-Dont-Know-JS/blob/1ed-zh-CN/scope%20%26%20closures/ch2.md)
---
# Part1-1 範疇與Closures篇
> (以下筆記部份[來源擷取自好想工作室RuRu的HackMD])：
## 何謂範疇
* 程式狀態(State)
幾乎所有的程式語言最基礎模型之一就是在`變數`中存值並且在稍後取出或修改這些值的能力，事實上，這個能力給程式賦予了`狀態`(state)
* 範疇(Scope)
定義如何在某些位置儲存`變數`，以及如何稍後找到這些`變數`，我們稱這組規則為`範疇`(scope)
## JS事實上是一種編譯式語言
即時編譯器則混合了這二者，一句一句編譯原始碼，但是會將翻譯過的代碼快取起來以降低效能損耗。相對於靜態編譯代碼，即時編譯的代碼可以處理延遲繫結並增強安全性。
[Background compilation · V8](https://v8.dev/blog/background-compilation)
## 編譯Compiler的三個步驟
> 書中提到任何js程式碼在執行前都要編譯完成
### 1. Tokenizing 、Lexing
將一連串`字元`打斷成（對於語言來說）有意義的片段，稱為token（記號）。
> Tokenizing與Lexing的`不同`就是這個東西有無"程式狀態(RHS或LHS的動作)"的差異，若有就是Lexing.
## Token(記號)分成以下6類
> 我們在程式碼上面所打下的每個字元都是token
> * identifier: names the programmer chooses;
> * keyword: names already in the programming language;
> * separator (also known as punctuators): punctuation characters and paired-delimiters;
> * operator: symbols that operate on arguments and produce results;
> * literal: numeric, logical, textual, reference literals;
> * comment: line, block.
![](https://i.imgur.com/Brx2bqx.png)
```javascript
x=a+b*2;
// [(identifier, x), (operator, =), (identifier, a), (operator, +), (identifier, b), (operator, *), (literal, 2), (separator,;)]
```

```javascript
var a = 2;
// var ，
// a ，
// = ，
// 2 ，
// ;
```

## 空格是否會被解釋要看他的意義。

```javascript
a            =          b * d-c;
// 同等於 a = b * d - c;
if (a > b) {
    document.write ("a is greater than b.")
;}
else {
    document.write ("a is not greater than b")
;}
// 同等於 
// if (a > b) { document.write ("a is greater than b.");} 
// else {document.write ("a is not greater than b"); }
```
[Whitespace in JavaScript](http://www.scriptingmaster.com/javascript/whitespace-javascript.asp)
[Understanding V8’s Bytecode - DailyJS - Medium](https://medium.com/dailyjs/understanding-v8s-bytecode-317d46c94775)
## 2. Parsing(剖析，或『語法解析』)
將一個token的流（陣列）轉換為一個樹狀結構，它綜合地表示了程式的語法結構，這種樹狀結構就稱為AST(abstract syntax tree抽象語法樹)。
![](https://i.imgur.com/twvAUy3.png)

## 3. Code-Generation
這個處理將抽象語法樹轉換為可執行的代碼。這一部分將根據語言，它的目標平台等因素有很大的不同。
#### 可以透過下列方式查看解析的代碼：

* 指令：透過 node.js把js程式碼編譯成`ByteCode`的過程				 
```
node --print-bytecode test.js
```
![](https://miro.medium.com/max/1400/1*aal_1sevnb-4UaX8AvUQCg.png)
## 了解範疇Scope
### 角色：
1. 引擎(Engine)：負責從始至終的編譯和執行我們的JavaScript`程式`。
2. 編譯器(Compiler)：引擎的朋友之一；處理所有的解析和代碼生成的重活兒（見前一節）。
3. 作用域(Scope)：引擎的另一個朋友；收集並維護一張所有被聲明的標識符（變量）的`清單`，並對當前執行中的代碼如何訪問這些變量強制實施一組嚴格的規則。

### 情境舉例：
```javascript
var a = 2;
// complier 確認 a 變數是否存在 scope 中，不存在則在 scope 中新增 a
// 引擎執行 complier 編譯出的程式碼，遇到變數會詢問 scope 使否存在該變數，沒有就向外尋找。
```
### 查找方式分為兩種
1. LHS：查詢變數本身，並且賦予它數值。
2. RHS：查詢變數的數值。
```javascript
console.log(a); // 查找a的值 RHS
```
```javascript
a = 2 // LHS 賦予值給a
var a; // complier的時候會定義a
```
## Function Declaration與Function Expression的不同
* function foo(a)：函式宣告式(Function Declaration)
* var a; a = function：函式運算式(Function Expression)這裡的var a是`Compiler`去請`Scope`定義的
> 書中提到var a;這件事情並不適用LHS或RHS
## RHS | LHS 查找動作的區別
因為在`變數`還沒有被`宣告`的情況下，這兩種類型的查詢的行為不同。

RHS: 查詢在`巢狀`的最接近的Scope的地方找不到`目標變數`，就會繼續往外(上)找尋，一旦到達全域範疇還是沒有找到，這會導致引擎拋出一個ReferenceError。
> 如果在某次的RHS查詢動作有找到一個變數，但你試圖對他做不可能成功的事情，那麼引擎就會擲出TypeError
> RefferenceError與範疇解析動作失敗有關，但是TypeError則暗示範疇的解析成功了，但你試圖對結果進行不可能的動作

LHS(無strict模式下): LHS查詢最接近的Scope的地方找不到`目標變數`，就會繼續往外(上)找尋，一旦但到達了全域範疇，都沒有找到`目標變數`，那麼全域範疇就會`全域範疇`中`建立`那個名稱的新`變數`，然後把它交還給引擎。

LHS(strict模式下): LHS查詢最接近的Scope的地方找不到`目標變數`，就會繼續往外(上)找尋，一旦但到達了全域範疇，都沒有找到`目標變數`，那麼引擎會拋出一個ReferenceError，就類似RHS的情況那樣。
:::info
在嚴格模式(strict)下他不允許這種自動的全域變數建立一個新變數

反之，以下面的例子就是在沒有使用`嚴格模式`(`use strict`)情況下，當LHS在內層找不到b這個變數去存值的時候，會繼續往外層找尋，若外層也找不到的話，compiler會請全域scope在全域變數中建立b這個變數，事實上JS讓瀏覽器上有默認`容錯`的機制
```javascript
function foo(a) {
	b = a;
}

foo( 2 );
```
:::
# Part1-2 範疇與Closures篇
> (以下筆記部份[來源擷取自好想工作室Titan的HackMD])：
## 語彙範疇
> 前一章提到：
scope 是一組規則，用來規範 engine 如何藉由一個變數的識別字名稱 (identifier name) 查找它，並在目前的 scope 或包含目前 scope 的任何 nested scope 中找到它。
* 範疇的運作方式有2種模型：
### 1. 語彙範疇 lexical scope
大多數程式語言所使用
### 2. 動態範疇 dynamic scope
有些語言所用，例如：Bash scripting、Perl 的某些 mode...等
## Lexing time (語彙分析時期)
標準語言編譯器的第一階段稱為 lexing(語彙分析)
> lexing = tokenizing(書中翻譯：語法基本單元化)
lexing 過程會檢視一連串原始碼字元，並指定語意給那些tokens，作為某些有狀態的剖析動作之結果
### (Lexical Scope)語彙範疇
語彙範疇就是在語彙分析時期(lexing time)定義的範疇
> 我自己的理解為：類似在running time時lexer(語彙分析器)即時動態處理你所寫的程式碼，這區塊的範疇由你寫的碼決定
下面範例有三個 nested scope，可把這些 scope 視為彼此內部的 bubble：
![](https://i.imgur.com/61Xgxcv.png =340x)
* Bubble 1 包含 (encompasses) global scope，其中的 identifier：`foo`
* Bubble 2 包含 `foo` 的 scope，其中的 identifier：`a`、`b` 和 `bar`
* Bubble 3 包含 `bar` 的 scope，其中的 identifier：`c`
> scope bubble 的定義取決於哪些 scope 的 block 是在哪裡 written 的、哪一個 nested inside (內嵌) 在另一個裡面等等。
> 例如我們定義bar函式的地方，就在於foo的泡泡中。

在 JS，劃分範疇的單位可分為兩種
* 函式範疇(function scope)
函式會建立自己的範疇，其內的identifier name（不管是變數、函式）僅能在這個函式裡面使用。

> (以下範例[來源擷取自網路](https://cythilya.github.io/2018/10/19/function-vs-block-scope/))：
在全域範疇底下，是無法存取 foo 內的 a、b、c 和 bar，否則會導致 ReferrenceError；但在 foo 自己的函式範疇內，可以存取 a、b、c 和 bar。
foo 可自由存取其內的 a、b、c 和 bar
```javascript
function foo(a) {
  var b = 2;

  function bar() {
    // ...
  }

  var c = 3;

  console.log(a); // 2
  console.log(b); // 2
  console.log(c); // 3

  bar();
}

foo(2);
```
> 反之，全域範疇之下是無法存取 foo 內的 a、b、c 和 bar 的，但可存取 foo 喔！
```javascript
function foo(a) {
  var b = 2;

  function bar() {
    // ...
  }

  var c = 3;
}

foo(2);

console.log(a); // ReferrenceError
console.log(b); // ReferrenceError
console.log(c); // ReferrenceError

bar(); // ReferrenceError
```
* 區塊範疇(block scope)
在 ES6 以前，只有函式能建立範疇，而在 ES6 之後，可用大括號 { ... } 定義區塊範疇，讓 const 和 let 宣告以區塊為範疇的變數。
> (以下範例[來源擷取自網路](https://cythilya.github.io/2018/10/19/function-vs-block-scope/))：
以下以`let`為例子

以下在foo中的變數bar不能在全域使用
```javascript
var foo = true;

if (foo) {
  let bar = foo * 2;
  console.log(bar); // 2
}

console.log(bar); // ReferenceError
```
以下當 let 宣告於 for 迴圈內時…i 一但出了第一個大括號所包含的範圍就會報錯。
```javascript
for (let i = 0; i < 10; i++) {
  console.log(i);
}

console.log(i); // ReferenceError: i is not defined
```
上面例子也可以改寫成以下：
```javascript
{
  let i;
  for (i = 0; i < 10; i++) {
    console.log(i);
  }
}

console.log(i); // ReferenceError: i is not defined
```
注意：const 與 let 不會有拉升（hoisting）的狀況。
```javascript
var foo = true;

if (foo) {
  console.log(bar); // ReferenceError
  let bar = foo * 2;
}
```
## Look-ups (查找)
* `look-up` 只要找到第一個 match 的就會停止動作
* 相同的識別字名稱 (identifier name) 可在 nested scope 的多層中指定，這稱為「遮蔽 (shadowing)」(內層識別字 (inner identifier) 遮蔽外層識別字 (outer identifier))
> (以下範例[來源擷取自網路](https://cythilya.github.io/2018/10/19/function-vs-block-scope/))：
### 例子|非巢狀
程式碼會直接從上到下跑完，具名函式會覆蓋掉前面的同名函式，執行時就會`look-up`最後的那行函式
```javascript
function doSomething(a) {
  b = a + doSomethingElse(a * 2);
  console.log(b * 3);
}

function doSomethingElse(a) {
  return a - 1;
}

var b;

doSomething(2); // 12

function doSomethingElse(a) {//這一行會覆蓋掉上面同名的函式，所以執行時就會執行這個函式的內容
  return a - 2;
}
```
> (以下範例[來源擷取自網路](https://cythilya.github.io/2018/10/19/function-vs-block-scope/))：
### 例子|巢狀
不管有無遮蔽，`look-up` 永遠都會從當時被執行的最內層 scope 開始，並往外或往上尋找，直到找到第一個 match 的為止
```javascript
function doSomething(a) {
  var b;
  b = a + doSomethingElse(a * 2);//執行doSomethingElse時

  console.log(b * 3);

  function doSomethingElse(a) {//先找同一層的函式
    return a - 1;
  }
}

doSomething(2); // 15

function doSomethingElse(a) {//因為已經找到所以不會被執行這函式
  return a - 2;
}
```
> 全域變數會自動成為全域物件 (global object，例如：瀏覽器的 window 等) 的 properties，所以可以不直接透過其 lexical 名稱來引用全域變數，而間接的把它當作全域物件的一個 property 來引用。例如：
```javascript
var result = 0;

function foo(x, y) {
  // result: global, shadowed variable
  var result = x + y;
  console.log(result);  // 3
  // 可用 global object 的 property 來存取
  console.log(window.result);  // 0

  function bar(z) {
    // y: non-global, shadowed variable
    var y = 0;
    var result = x + y + z;
    console.log(x, y, z);   // 1 0 3

    // 無法用 global object 的 property 來存取
    console.log(window.y);  // undefined

    console.log(result);    // 4
    // 可用 global object 的 property 來存取
    console.log(window.result);  // 0
  }

  bar(3);
}

foo(1, 2);
//原本此全域變數因為被遮蔽而無法存取，而透過此技巧就可以存取此全域變數了，但是被遮蔽的非全域變數 (non-global shadowed variable) 就無法存取了。
```
不管函數是從哪裡 invoked (被調用)，也不論它是如何 invoked，它的 lexical scope 只由宣告函數的位置來定義。
換句話說：
『當函式被建立的時候，不論是全域變數or區域變數都已經被記住了』

> lexical scope look-up 處理只適用於 first-class identifiers，例如：`a`、`b` 和 `c`。若某段程式碼中有 `foo.bar.baz` 的引用，則 lexical scope look-up 會用來尋找 `foo` 關鍵字，但只要找到該變數的位置，物件特性存取規則 (object property-access rules) 會接管後續的工作，分別解析 (resolve) `bar` 和 `baz` property。
```javascript
obj = {
name = "Zen"
}
//obj 是全域Look-up
//obj.name 則是另一套物件特性存取規則
```
### First-Class function頂級函式
被當成任何變數來處理的函式(在JS函式可以被存進變數裡)

> 函式作為參數傳給其他函數 (作為參數傳遞給另一個函式的函式稱為 callback function)
```javascript
function sayHello() {
  return "Hello, ";
}
function greeting(helloMessage, name) {
  console.log(helloMessage() + name);
}
// 將 `sayHello函式` 作為參數傳給 `greeting` 函式
greeting(sayHello, "JavaScript!");
```

> 將函式 (可用匿名函式或具名函式) assign 給一個變數
```javascript
const foo = function() {// 匿名函式存在foo中
  console.log("foobar");
}
// 使用變數 invoke 函式
foo();
```
> 函數可由另一個函數來回傳，把函數當作值來使用 (回傳的函數稱為 higher-order function (高階函數))
```javascript
function sayHello() {
  return function() {//高階函數
    console.log("Hello!");
  }
}
```
### invoke 此函數和回傳的匿名函數有兩種方法：
1. 使用變數：需使用另一個變數，若直接 invoke sayHello，只會回傳函數本身，不會 invoke 回傳的值
```javascript
const sayHello = function() {
  return function() {
    console.log("Hello!");
  }
}
const myFunc = sayHello();
myFunc();
```
2. 使用雙括號
```javascript
function sayHello() {
  return function() {
    console.log("Hello!");
  }
}
sayHello()();
```
## Cheating Lexical (欺騙 lexical)
lexical scope 是由函數在何處宣告所定義，這完全是一種 author-time 的決策 (decision)。

JS 有兩種機制可以在 runtime 修改或新增 lexical scope，分別是 `eval()` 和 `with`。這兩個都是不良的實務作法，欺騙 lexical scope 會導致效能較差。

* `eval()`：接受含有一個或多個宣告的程式碼字串後，就能修改現有的 lexical scope
* `with`：從你傳入給它的物件，憑空建立全新的 lexical scope


> `eval()` 和 `with` 都會受嚴格模式 (strict mode) 限制：
> * `with` 被禁止使用
> * `eval()` 保留核心功能，但間接或危險的使用方式會被禁止

### `eval()`

> 不建議使用 `eval()`！

能在 runtime 修改一個 author-time 的 lexical scope

* 接受一個字串作為 argument，並將字串的內容視為是在程式的該時間點上，已經實際被編寫好的 (authored) 程式碼
* 能夠已程式化的方式在你編寫的程式碼中產生程式碼，並執行所產生的程式碼
* 也就是 `eval()` 藉由作弊修改了 lexical scope environment，並假裝 author-time (即 lexical) 程式碼原本就在那
* 在 `eval()` 被執行之後的後續程式碼中，engine 不會知道或在意前面的程式碼是動態解譯 (dynamically interpreted) 的，並因此修改了 lexical scope environment，engine 只會照常進行它的 lexical scope look-ups 動作

例如：
```javascript
function foo(str, a) {
  eval( str ); // 如同寫入var b = 3;屏蔽了global的變數b
  console.log(a, b);
}

var b = 2;
foo("var b = 3;", 1); // 1 3
```
對 engine 來說，`eval()` 那行等同於 `var b = 3;`，因為宣告了 `b` 變數，會修改 `foo()` 現有的 lexical scope。而在 `foo()` 內建立的變數 `b` 會遮蔽 (shadows) 宣告在外層 (全域) scope 中的 `b`。

當 `console.log()` 呼叫時，會在 `foo()` 的 scope 內找到 `a` 和 `b`，永遠不會找到外層的 `b`。

> 從 ES5 開始，若透過除了 `eval` 以外的引用來間接地 invoke `eval()`，`eval` 會在 global scope 的 context 中執行，而不是在 local scope 執行，例如：函數宣告會建立全域函數，並且被評估 (evaluated) 的程式碼無法在被呼叫的 scope 內存取 local 變數 ：

```javascript
function test() {
  var x = 2, y = 4;
  // 直接呼叫，使用 local scope，結果為 6
  console.log(eval('x + y'));

  // 相當於在 global scope 內呼叫 eval
  var geval = eval;

  // 間接呼叫，使用 global scope
  // 因 `x` 是 undefined，所以拋出 ReferenceError  
  console.log(geval('x + y'));

}
```

> eval() 在嚴格模式 (strict-mode) 中使用時，會在它自己的 lexical scope 中運作，這代表 eval() 在內部所做的宣告都不會改到 enclosing scope (包含他的 scope)。
```javascript
function foo(str) {
  "use strict";
  eval(str);
  console.log(a); // ReferenceError: a is not defined
}

foo("var a = 2");
```

> 棄用：
> `setTimeout()` 和 `setInterval()` 也能接受一個字串作為第一個 argument，該字串內容可作為動態生成函數的程式碼來估算。

> 避免使用：
> `new Function()` 這個 function constructor 也可接受一個程式碼字串作為最後一個 argument，並將之轉為一個動態生成函數 (如果有前面的幾個 argument，就會式該新函數的具名 named parameter)。雖然此語法稍微比 `eval()` 安全，但應避免使用。

### `with`

> 不建議使用 `with`！

透過 `with` 陳述句傳入的物件沒有指定的 property 時，會為該 property 建立名為 property 名稱的全域變數。

可對一個物件進行多次 property 參考，而不用每次都重複引用物件本身的一種簡寫 (short-hand) 方式。例如：
```javascript
var obj = { a: 1, b: 2, c: 3};

//  重複obj 顯得比較囉嗦
obj.a = 2;
obj.b = 3;
obj.c = 4;

// 更簡單的簡寫
with (obj) {
  a = 3;
  b = 4;
  c = 5;
}
```
但有時發生的事情不只是物件 property 存取的簡寫而已。例如：

```javascript
function foo(obj) {
  with (obj) {
    a = 2; //執行o2的時候，因為這層找不到a變數，所以就找到全域，並且在全域宣告了a變數
  }
}

var o1 = { a: 3 };
var o2 = { b: 3 };

foo(o1);
console.log(o1.a);  // 2

foo(o2);
console.log(o2.a);  // undefined
console.log(a);     // 2 -- Oops，leaked global!
```

在 `with` 區塊中，很像是對一個變數 `a` 的正常 lexical 參考一樣，但其實是一個 LHS 參考，將 `2` 這個值指定給它。

* 傳入 `o1` 時，`a = 2` 這個指定找到了 `o1.a` property 並指定 `2` 這個值給它
  - 由 `with` 陳述句所宣告的 scope 就是 `o1`，在該 scope 中有一個識別字可以對應的 `o1.a` property
* 傳入 `o2` 時，`o2` 沒有 `a` property，所以不會建立此 property，並且 `o2.a` 仍為 `undefined`
  * 將 `o2` 作為 scope 時，沒有 `a` 識別字，所以依循正常規則的 LHS identifier look-up 就發生
  * 不管是在 `o2` 的 scope、`foo()` 的 scope 或 global scope 都找不到 `a` 識別字，所以當 `a = 2` 被執行時，就會導致自動的全域值被建立出來 (若在嚴格模式就無法被執行)

`with` 陳述句接收一個帶有零或多個 property 的物件，並把該物件視為一個好像完全獨立的 lexical scope，所以該物件的 property 在該 scope 中會被視為 lexically 定義的識別字。

也就是說`with`會在runtime的時期一邊把接收物件參考的property給改寫並且建立全新的`scope`，而那個物件的property就會成為該範疇內的識別字，我自己把它想成跟`eval`相異的點是`eval`雖然也是在runtime時期，但他可以修改現有的語彙範疇(`lexical scope`)。

> 書中提到，即使 with 區塊將物件視為 lexical scope，但在 with 區塊內的正常 var 宣告不會以該 with 區塊作為 scope，而是歸包含該區塊的函數 scope 所有。
> 
意思就是說，當with的範疇裡面有var變數的時候，會以包含with的函示所使用此變數，就如以下例子變數C就是歸函式foo所用。但是全域就找不到C所以就會回傳ReferenceError: c is not defined的錯誤訊息。
```javascript
var obj = { a: 8 };
function foo() {
  var a = 0;
  with (obj) {
    a = 1;
    b = 2;//因為LHS所以在全域建立了var b
    var c = 3;
  }
  console.log(a);    // 0
  console.log(b);    // 2, 由此可見這範疇也能看到全域的b
  console.log(c);    // 3
  console.log(obj);  // { a: 1 }
}
foo();
// console.log(a);  // ReferenceError: a is not defined
console.log(b);     // 2, 全域的b
// console.log(c);  // ReferenceError: c is not defined
console.log(obj);   // { a: 1 }
```

### Hoisting發生在編譯時期

# Part1-3 函式vs區塊範疇
## 函式範疇 (function-based)

範疇 (scope) 由一系列的「泡泡」所構成，而這種巢狀結構 (nesting) 是在編寫時期(author time) 所定義的。範疇皆已定型，包含巢狀結構函式。並不會隨著如何呼叫函式有所改變。

函式範疇中所有**變數**都屬於函式，可重複使用以及在必要時接納不同型別的值 (重新賦值)。

又可大致分為全域範疇 (global) 與區域範疇 (local)。

---

[我知道你懂 hoisting，可是你了解到多深？](https://blog.techbridge.cc/2018/11/10/javascript-hoisting/)

>Every execution context has associated with it a variable object. Variables and functions declared in the source text are added as properties of the variable object. For function code, parameters are added as properties of the variable object.

所有 function 需要的資訊都會存在 EC(Execution Contexts)，執行環境裡面。

- variable object（以下簡稱 VO）
每個 EC 都會有相對應的 variable object，在裡面宣告的變數跟函式都會被加進 VO 裡面，如果是 function，那參數也會被加到 VO 裡。
- Activation Object（以下簡稱 AO）
可以把它直接當作 VO 的另外一種特別的型態，只在 function 的 EC 中出現，所以在 global 的時候我們有 VO，在 function 內的時候我們有 AO，差別在於 AO 裡面會多記載一個 arguments。

引數(Argument) vs. 參數(Parameter) 

```javascript=
function foo(參數){}
foo(引數)
```

---

:::info
使用「函式範疇」有什麼好處呢？
- 維持最小權限原則 (principle of least privilege)，以避免變數或函式被不當存取。
- 避免同名識別字所造成的衝突，這當中包含了避免污染全域命名空間和模組的管理。
:::

```javascript=
// globel
debugger 
var globalScopeVar = "globalScopeVar"
globalNokeyword = "globalNokeyword"

// script
debugger
const scriptScopeConst = "scriptScopeConst";
let scriptScopeLet = "scriptScopeLet";
```

window.globalScopeVar 與 window.globalNokeyword 可在全域屬性查找到。
使用 const 與 let 關鍵字會分配在 script 區域。

```javascript=
<script>
  var globalScopeVar = "globalScopeVar";
  let scriptScopeLet = "scriptScopeLet";
</script>
<script>
  console.log(globalScopeVar); // "globalScopeVar"
  console.log(window.globalScopeVar); // "globalScopeVar"
  console.log(scriptScopeLet); // scriptScopeLet
  console.log(window.scriptScopeLet); // undefined
</script>
```

---

```javascript=
{
  debugger
  var globalScopeVar = "globalScopeVar";
  const blockScopeConst = "blockScopeConst";
  let blockScopeLet = "blockScopeLet";
}
// BlockScope
```
```javascript=
function foo(a=1){
debugger
  var b = 2;
  let c = 3;
  return function bar(d=4){ // 內崁範疇 nested scope
    var e = 5;
    console.log(a,b,c,d,e);
  }
}
```
函式參數 a: 1 會被歸類於 localscope

---

### 避免衝突

```javascript=
function foo(){
debugger
  function bar(a){
    i = 3; // 此時改成 var i = 3; 遮蔽變數「shadowed variable」
    console.log( a + i);
  }
  for(var i = 0; i < 10 ;i++) {
    bar(i * 2);
  }
}

function foo(){
  var i = undefined;
  function bar(a){
    i = 3; // 內崁範疇 nested scope
    console.log( a + i);
  } // 偽私域
  for(var i = 0; i < 10 ;i++) {
    bar(i * 2);
  }
}
// 3 11 11 11 ...
```

此時直接在 for 迴圈的標頭 (header) 中宣告變數 var i，易忽略「該變數實際的範疇是包含它的範疇（函式或全域範疇）」這個事實。

```javascript=
if(true){
  var bar = 2;
}// 偽私域

for(var i = 0; i < 10 ;i++) {
  console.log(i);
}// 偽私域
```

此時代表 Window.Properties 可查找到 bar 與 i 識別字。

---

### 全域命名空間 (global namespaces)

透過集中管理全域變數，只對外提供單一組變數，避免全部皆位於頂層語彙範疇的識別字。

```javascript=
let nameSpaces = {
  domain: "Uniform Resource Locator",
  doSomthing(){
    // ...
  },
  doAnothering(){
    // ...
  }
}
```

### 即刻調用函式運算式 IIFE

利用 Grouping operator()，分組運算子處理。包裹它的第一對 () 使得那個函式成為一個運算式，而那第二對的 () 則會執行該函式。

該函式不會被當成一個標準的宣告 (declaration) 需具名來看待，而是被當作一個函式運算式(function expression)。

```javascript=
(function(){
  // doSomething
})(Actual arguments)
```

  const blockScopeConst = "blockScopeConst";
  let blockScopeLet = "blockScopeLet";

```javascript=
var globalScopeVar = "globalScopeVar";

(function IIFE(window) {
  var localScopeVar = "localScopeVar";
  console.log(localScopeVar); // "localScopeVar"
  console.log(window.globalScopeVar); // "globalScopeVar"
})(window);

console.log(globalScopeVar); // "globalScopeVar"
```

---

javascript ES3 規格在早期已提供少許區塊範疇處理方式，包含 with 用法以及以下 try / catch

```javascript=
try{
  undefined(); // 迫使一個例外產生的非法作業
}
catch(error){
  console.log(error);
}
// TypeError: undefined is not a function at <anonymous>:2:3
console.log(error);
// VM1020:1 Uncaught ReferenceError: error is not defined at <anonymous>:1:13
```

---

## 區塊範疇 (block-scoping)

ES6 最小權限原則 (principle of least privilege)。

```javascript=
if(true){
  var bar = 2;
}// 偽私域

if(true){
  let bar = 2;
}// 真區域
```
```javascript=
for(var i = 0; i < 10 ;i++) {
  console.log(i);
}// 偽私域

for(let i = 0; i < 10 ;i++) {
  console.log(i);
}// 真區域
console.log(i); // Uncaught ReferenceError: i is not defined
```

for 迴圈標頭 (header) 中的 let 不只將 i 繫結到 for 迴圈的主體 (body)，實際上它還會將之 **重新繫結(rebinds)** 到迴圈的每次迭代 (iteration)，確保有將前一次迴圈迭代結果產生的值重新指定給它。
### example
#### let
```javascript
for(let i=0;i<3;i++) {
    setTimeout(()=>console.log(i),1)
}
// 1 2 3
```
以上會因為let rebin到每次的迭代，會成以下：
```javascript
for(let i=0;i<3;i++) {
    i=0
    setTimeout(()=>console.log(i),1)
}
for(let i=0;i<3;i++) {
    i=1
    setTimeout(()=>console.log(i),1)
}
for(let i=0;i<3;i++) {
    i=2
    setTimeout(()=>console.log(i),1)
}
```
而用var

```javascript
for(var i=0;i<3;i++) {
    setTimeout(()=>console.log(i),1)
}
// 3 無限迴圈...因為var i 受到汙染
```

---

### let keyword

let 關鍵字會把變數宣告接附到 (attaches to) 它所在的(包含它的)區塊(通常是一對 =={...}==)的範疇上。換句話說，**let 為它的變數宣告隱含地劫持了任何區塊的範疇**。

區塊範疇 (block-scoping): 盡可能在離最近的本地 (local) 宣告變數。以 `{}` separator 為範疇。

```javascript=
if(true){
  {
    let bar = 2;
  }
}

// 明確區塊繫結方式，只要在能夠使用述句 (statement) 任何地方放入一對{...}時皆可。

{
  let bar = 2;
}
```

區塊範疇之所以有用的另外一個原因與 closures（閉包-第五章）和取回記憶體用的垃圾回收(garbage collection) 有關。hoisting(拉升-第四章) 後續章節詳解。

雖然有些人如此相信，但區塊範疇不應該被當作用來取代 var 函式範疇的東西，這兩種功能可以共存。函式範疇與區塊範疇技巧都能兼用。
# Part1-4 拉升
let和const會在報錯是因為範疇，要不要提升Hoisting取決於是var還是let,const
### 概念
- 範疇(scope)概念
- 變數依宣告地點與方式的不同被接附到(attached to)不同層級的範疇上

而我們所認為的程式碼被逐行執行是真的嗎？為什麼會有hoisting 現象？

## JavaScript 特有的 hoisting 現象
### 變數或函式的宣告會提升，賦值不會
程式碼是一行行被執行的，如果以下面的例子來說，變數`a`還沒被聲明就被賦值，應該會出現什麼？
```javascript=
// ex 1
a = 42;
var a;
console.log( a ); 
```
我們預期的`undefined`沒出現，卻出現了`42`


```javascript=
// ex 2
console.log( a );
var a = 42;
```
我們預期的`ReferenceError: a is not defined`沒出現，卻出現了`undefined`為什麼？
另一個例子
```javascript=
// ex 
function test(n){
  var n
  console.log(n)
  n = 12
  console.log(n)
}
test(42) // 42  12
```

在程式一行行的被解釋執行之前，JavaScript 一定有做了什麼事...
JavaScript 是腳本語言、單一序，但在程式碼的任何部分被執行之前，所有的聲明，變數和函式，都會首先被處理，也就是會被預編譯。

#### 語法分析 -->  預編譯 --> 執行程式碼 ，`hoisting` 在預編譯時期產生。

經過 hoisting 實際上程式碼成為：
```javascript=
// ex 1 hoisting
var a;
a = 42;

console.log( a ); 
```

```javascript=
// ex 2 hoisting
var a
console.log( a );
a = 42;
```


### 提升動作是逐範疇(per-scope)進行的

```javascript=
// ex 3
foo()
function foo(){
  console.log(a)
  
  var a = 42

}
```
hoisting 現象
```javascript=
// ex 3 hoisting

function foo(){
  var a
  console.log(a)
  a = 42
}
foo()
```
### 函式宣告會被提升，但函式運算式(function expressions)不會
```javascript=
// ex 4
foo();

var foo = function bar(){
  console.log(a)
  
  var a = 42
}
// TypeError: foo is not a function
```
### 在 scope 裡也會有提升現象
```javascript=
// ex 4 hoisting
var foo

foo();
bar()

foo = function {
  var a
  console.log(a)
  a = 42
}

```

## 提升的優先順序 函式 --> 變數
- function 的宣告也會提升，而且優先權比較變數高
```javascript=
// ex 5
console.log(test) 
var test
function test(){}
// ƒ test(){}
```
提升後
```javascript=
// ex 5 hoisting
test()

console.log(test) 
// var test
function test(){}
// ƒ test(){}
```
### 變數重複宣告會被忽略，函式重複宣告前面的會被覆寫
```javascript=
// ex 6
foo() // 3

function foo(){
console.log(1)
}

var foo = function foo(){
console.log(2)
}

function foo(){
console.log(3)
}
```



### let 跟 const 也會提升
```javascript=
console.log(test) // ReferenceError: test is not defined
let test

console.log(test2) // SyntaxError: Missing initializer in const declaration
const test2
```
let 跟 const 的差別

```javascript=
var nbr = 42
function test(){
  console.log(nbr)
  let nbr
}
test() // ReferenceError: Cannot access 'nbr' before initialization at test
```
let 仍有提升，只是提升後的行為跟 var 不一樣，會誤以為它沒有提升。
TDZ = time ..


## hoisting 是怎麼運作的？ 
語法分析 --> 預編譯 --> 逐行執行
- 程式碼是如何被預編譯？hoisting 是預編譯時期所產生的
- 在程式碼的任何部分被執行之前，所有的聲明，變數和函式，都會首先被處理。
 
## 補充 預編譯前奏
- imply global 暗示全域變數：即任何變數，如果變數未經聲明就賦值，此變數就為全域物件所有。
ex. a = 123; 
ex. var a = b = 123; 

```javascript
function test() {
  var a = b = 123;
}
// b 未聲明 就賦值 這個變數就歸 window 所有
test();
window.a; // undefined
window.b; // 123

```

### 一切聲明的域局變數，全都是window的屬性。window 就是全域
ex. var a = 123; ==> window.a = 123;
如同：window( a  : 123)
```javascript
// 試著印出不同位置的變數
function fn(a) {
  console.log(a);
  var a = 123;
  console.log(a);
  function a() {}
  console.log(a);
  var b = function () {}
  console.log(b);
  function d() {}
}
fn(1)
```

預編譯發生在函式執行的前一刻
預編譯四部曲：
1. 創建一個 AO (Activation Object)的物件物件 -> 作用域（執行期上下文）
ex. AO{
  a : undefined -> 1,
  b : undefined,
  d : 
}

2. 找形參和變數聲明，將變數與形參名作 AO 屬性名，值為undefined。
3. 將實參值與形參統一
4. 在函式體裡面找函式聲明。並值賦給函式體。 
a : undefined -> 1 -> function a(){}
b : undefined -> function b(){}
d : function d(){}


  3. 解釋執行
  ```javascript
  function test(a, b) {
    console.log(a);
    c = 0;
    var c;
    a = 3;
    b = 2;
    console.log(b);
    function b() {}
    function d() {}
    console.log(b);
  }
  test(1)
  ```
  AO{
    a : undefined -> 1 (把形參和實參相統一) -> 3
    b : undefined -> function b() {} -> 2
    c : undefined -> 0 ->
    d : undefined -> function d() {}

  }

### 預編譯四部曲：
1. 創建 AO (Activation Object)物件 -> 作用域（執行期上下文）
2. 找形參和變數聲明，將變數與形參名作 AO 屬性名，值為undefined。
3. 將實參值與形參統一（把引數和參數統一，也就是將引數的值指向參數位置）
4. 在函式體裡面找函式聲明。並值賦給函式體。

提升順序：函式->變數->參數
  AO {
    a : undefined -> function a() {} -> 123
    b : undefined -> function () {} -> 234;
  }
  console:
  1. a : function a() {}
  2. b : undefined
  3. b : 234;
  4. a : 123;
  5. a : 123;
  6. b : function(){};

## 全域預編譯
- 預編譯不只發生在函式內，也發生在全域。只是全域裡沒有所謂的參數，所以編譯四部曲的第3會直接跳第4。
- 全局在預編譯時所產生的不是 AO 物件，而是 GO物件 (Globe Object) / VO 
  GO == window

可分兩部分來解析 GO{}和AO{}
GO { // 提升
    test : function(){};

}
```javascript
console.log(test);
function test(test) {
  console.log(test);
  var test = 234;
  console.log(test);
  function test() { 
  }
}
test(1);
var test = 123;
```
AO {
  test : undefined -> 1 -> function(){} -> 234 -> 234
}

參考：
[我知道你懂 hoisting，可是你瞭解到多深？](https://blog.techbridge.cc/2018/11/10/javascript-hoisting/)
[JavaScript: 變量提升和函數提升](https://www.cnblogs.com/liuhe688/p/5891273.html)
[(121) 09 递归，预编译（上）](https://www.youtube.com/watch?v=Yas_MUY9ND4&list=PL9nxfq1tlKKnmrO_xsXkBHNFUuZ-02268&index=9)
[所有的函式都是閉包：談 JS 中的作用域與 Closure](https://blog.techbridge.cc/2018/12/08/javascript-closure/)
[MDN解釋let](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let)
[[day21] YDKJS (Scope) : Hoisting ？ let 會 Hoist 嗎 ? - iT 邦幫忙::一起幫忙解決難題，拯救 IT 人的一天](https://ithelp.ithome.com.tw/articles/10225604)
# Part1-5 範疇的Closure
### closures的定義：
closure是函式`記得`並`存取`取其語彙範疇的能力，甚至當函式是在其語彙範疇之外執行時，也是如此。
### 範例
```javascript
function foo() {

var a = 0;

    function run() {
        a++;
        return a;
    }
    
    return run
}

var f = foo();
```

> closure是發生在宣告時期(declaration time)
## 接近Closure閉包
### 語彙範疇查找(Look-up)規則也是Closure的一部份

```javascript
function foo(){
    var a = 2;
    
    function bar() {
        console.log(a); //RHS查找到a=2
    }
    bar()
}
foo();
```
## Closure閉包登場
```javascript
function foo() {
    var a = 2
    function bar() {
        console.log(a);
    }
    return bar; //return到外面的變數baz
}
var baz = foo();

baz(); //2
```
但在這個情況下，它是在其宣告處的語彙範疇之外執行的。一般來說我們會預期foo()的整個內層範疇會在執行完畢後消失(a=2)，但closure的「魔法」並沒有讓那種事情發生

當變數baz被調用時，它恰如其分的能夠`存取`編寫時期(author-time)的語彙範疇，也就是存取變數a=2

內層bar()函式在語彙範疇上能夠`存取`foo的內層範疇，在這個例子，我們return了bar所參考的那個函式，將它作為一個值來傳遞。
執行了foo()之後，我們將它所回傳的值(我們內層的bar()函式)指定給了一個叫做baz的變數，然後我們實際調用(invoke)了baz()，等同於調用內層的bar函式。

:::success
bar()擁有一個語彙語彙範疇封閉包圍(closure over)了foo的內層範疇，bar()之後仍然參考指向那個範疇，而那個參考就叫做closure(閉包)
:::


### 當然，函式可作為值被到處傳遞，舉以下2個closure的例子
- function作為值傳入參數在其他地方被調用
```javascript
function foo() {
    var a = 2;
    
    function baz() {
    console.log(a); //2
    }
    bar(baz)
}
function bar(fn) {
    fn(); //baz()函式仍然有參考指向foo內層的範疇，也就是a=2
}
```
- 不傳入參數，但間接的(indirect)的調用
```javascript
var fn;
function foo() {
    var a = 2;
    
    function baz() {
        console.log(a) //RHS var a = 2
    }
    fn = baz; //baz傳給全域變數fn
}

function bar() {
    fn()
}

foo();

bar(); //2
```
### closure四處可見
- setTimeout
```javascript
function wait(message) {
    setTimeout(function timer() { //timer傳進setTimeout
    //而有了一個範疇封閉包圍了(closure over)wait()內的範疇
        console.log(message)
    },1000);
}
wait("Hello, closure!");
```
- jQuery
```javascript
function setupBot(name, selector) {
    $(selector).click(function activator() {
        console.log("Activating: " +name);
    });
}

setupBot("Closure Bot 1", "#bot_1")
setupBot("Closure Bot 2", "#bot_2")
```
### IIFE本身不是可觀測的closure實例，它絕對還是會建立範疇，而他是我們最常用來建立覆蓋的範疇工具
雖然技術上可以說closure事發生在宣告時期，但嚴格來講這個例子是無法被觀測到的。
```javascript
var a = 2;
(function IIFE() {
    console.log(a); //2 RHS語彙範疇查找到的
})();
```

> 這是數在森林中倒落時，周圍什麼人都沒有，沒人去聽樹倒的聲音。
### 那我們就，來用IIFE做一個觀察closure的例子
```javascript
var add = (function() {
    var count = 0;
    return function() {
        return count +=1;
    }
})();
```
## 迴圈與Closure
> setTimeout: 到達延遲秒數的時候才執行callback
> 
所缺少的東西是：我們語意目標暗示著我們想要讓迴圈的每次迭代都能在該次迭代進行時『捕捉』到它自己的i的一份拷貝。然而，因為範疇的運作方式，所有的那五個函式，雖然都是在各自的迴圈迭代中分別定義的，但他們都會覆蓋(close over)同一個共用的`全域範疇`，其中實際上只有一個i存在
```javascript
for (var i=1; i<=5; i++) {
	setTimeout( function timer(){
		console.log( i );
	}, i*1000 );
}
```
試試看用IIFE改寫(還是差一點)：因為如果那個範疇是空的，那麼你覆蓋(close over)它也沒有什麼用
```javascript
for(var i = 1; i <=5; i++){
    (function(){
        setTimeout(function timer(){
            console.log(i);
        }, i*1000);
    })()
}
```
他需要他自己的變數，來放置每次迭代i值的一份拷貝
```javascript
for(var i = 1; i <=5; i++){
    (function(){
        var j = i;
        setTimeout(function timer(){
            console.log(j)
        }, j*1000)
    })()
}
```
關於IIFE有人比較偏好稍微變化的版本是：
```javascript
for(var i = 1; i <= 5; i++){
    (function(j){
        setTimeout(function timer(){
            console.log(j);
        }, j*1000)
    })(i)
}
```
## 重訪區塊範疇
> 第3章向我們展示了let宣告，他會劫持一個區塊，並在那個區塊中宣告一個變數。

他(`let`)基本上把一個區塊變成變為了我們能夠覆蓋(closure over)的一個範疇
不管是前面的IIFE利用closure over的方式讓結果符合我們的預期，實際上我們需要的是每次迭代『專屬』的區塊範疇(有自己的變數儲存i而不被外面影響)。
```javascript
for(var i = 1; i<=5; i++){
    let j =i //好耶，closure的區塊範疇
    setTimeout(function timer(){
        console.log(j)
    }, j*1000)
}
```
還不只這樣，用在一個for迴圈標頭(heade)中的`let`宣告定義有一種特殊的行為，這個行為表示，那個變數不只是為該迴圈宣告一次，而是每次迭代都宣告一次
```javascript
for(let i = 1; i<=5; i++){
    setTimeout(function timer(){
        console.log(i)
    }, i*1000)
}
```
## 模組
- 相較於直接引入每一種功能到應用程式中，開發者們透過模組來提供額外的功能
- 只裸露出我們想提供的資訊，隱藏資料防止被修改
### 揭露模組(revealing module)
```javascript
function CoolModule() {
	var something = "cool";
	var another = [1, 2, 3];

	function doSomething() {
		console.log( something );
	}

	function doAnother() {
		console.log( another.join( " ! " ) );
	}

	return {
		doSomething: doSomething,
		doAnother: doAnother
	};
}

var foo = CoolModule();

foo.doSomething(); // cool
foo.doAnother(); // 1 ! 2 ! 3
```

### 以簡單的方式來說，要行使模組模式，有兩個必要條件：
- 必須有一個外層的包含函式，而他必須至少調用一次(每次都會建立一個新的模組實體)
- 這個包含函式至少得回傳一個內層函式，如此這個內層函式才能有覆蓋到那個私有範疇的closure，因此得以存取或修改那個私有狀態

前面的展示了一個獨立的模組創造器叫做CoolModule()，他可以被調用數次，每次都會建立一個心的模組實體，當你只想要有單一個實體的時候
#### singleton單體模式：
確保一個類別只有一個實體，並提供對該實體的全域操作
> 比如說，生活中每個人只有一個身分證號碼，若證件遺失仍然是用原有身分證號碼補發，並不會因此產生新的身分證號碼。
```javascript
var foo = (function CoolModule() {
	var something = "cool";
	var another = [1, 2, 3];

	function doSomething() {
		console.log( something );
	}

	function doAnother() {
		console.log( another.join( " ! " ) );
	}

	return {
		doSomething: doSomething,
		doAnother: doAnother
	};
})();

foo.doSomething(); // cool
foo.doAnother(); // 1 ! 2 ! 3
```
### 模組只是函式，所以他們能夠接收參數：
```javascript
function CoolModule(id) {
	function identify() {
		console.log( id );
	}

	return {
		identify: identify
	};
}

var foo1 = CoolModule( "foo 1" );
var foo2 = CoolModule( "foo 2" );

foo1.identify(); // "foo 1"
foo2.identify(); // "foo 2"
```
更強大的，為你回傳公開API物件取個名稱：
模組實體中保留那個公開API物件的一個內層參考，你就能夠從內部去修改那個實體模組，包含新增與移除方法的特性，還有變更它們的值。
```javascript
var foo = (function CoolModule(id) {
	function change() {
		// 修改公有 API
		publicAPI.identify = identify2;
	}

	function identify1() {
		console.log( id );
	}

	function identify2() {
		console.log( id.toUpperCase() );
	}

	var publicAPI = {
		change: change,
		identify: identify1
	};

	return publicAPI;
})( "foo module" );

foo.identify(); // foo module
foo.change();
foo.identify(); // FOO MODULE
```
## 現代模組
各種模組依存性載入器或管理器，基本上就是把模組定義的這種模式包成一個友善的API，我們不會檢視任何特定的程式庫。
以下這段程式碼最關鍵的部分是modules[name] = impl.apply(impl, deps)
這會為一個模組調用(並傳入任何依存性)定義包裹器函式，並將回傳的值，也就是模組的API，存入藉由名稱來紀錄的一個內部模組清單。
```javascript=
var MyModules = (function Manager() {
	var modules = {};

	function define(name, deps, impl) {
		for (var i=0; i<deps.length; i++) {
			deps[i] = modules[deps[i]];
		}
		modules[name] = impl.apply( impl, deps );
	}

	function get(name) {
		return modules[name];
	}

	return {
		define: define,
		get: get
	};
})();
MyModules.define( "bar", [], function(){
	function hello(who) {
		return "Let me introduce: " + who;
	}

	return {
		hello: hello
	};
} );

MyModules.define( "foo", ["bar"], function(bar){
	var hungry = "hippo";

	function awesome() {
		console.log( bar.hello( hungry ).toUpperCase() );
	}

	return {
		awesome: awesome
	};
} );

var bar = MyModules.get( "bar" );
var foo = MyModules.get( "foo" );

console.log(
	bar.hello( "hippo" )
); // Let me introduce: hippo

foo.awesome(); // LET ME INTRODUCE: HIPPO
```
## 未來模組
ES6為模組的概念新增了一級(first-class)的語法支援。經由這個模組系統載入，ES6會把一個檔案當成一個個別的模組。每個模組都能匯入(import)其他的模組或特定的API成員，也能夠匯出(export)他們自己的公開API成員。
ES6模組沒有『行內`inline`』的格式可以用，他們必須被定義在個別的檔案中(每個模組一個檔案)。瀏覽器或引擎會有一顆預設的『模組載入器』，他會在模組被匯入時，同步的載入一個模組檔案。

bar.js
```javascript
function hello(who) {
	return "Let me introduce: " + who;
}

export hello;
```
foo.js
```javascript
// 仅导入“bar”模块中的`hello()`
import hello from "bar";

var hungry = "hippo";

function awesome() {
	console.log(
		hello( hungry ).toUpperCase()
	);
}

export awesome;
```
```javascript
// 导入`foo`和`bar`整个模块
module foo from "foo";
module bar from "bar";

console.log(
	bar.hello( "rhino" )
); // Let me introduce: rhino

foo.awesome(); // LET ME INTRODUCE: HIPPO
```
import 在當前的作用域中導入一個模塊的API的一個或多個成員，每個都綁定到一個變量（這個例子中是 hello）。module 將整個模塊的API導入到一個被綁定的變量（這個例子中是 foo，bar）。export 為當前模塊的公有API導出一個標識符（變量，函數）。在一個模塊的定義中，這些操作符可以根據需要使用任意多次。

在 模塊文件 內部的內容被視為像是包圍在一個作用域閉包中，就像早先看到的使用函數閉包的模塊那樣。

### 以下兩個例子差異在return，可看出console.dir模式下的[[Scope]]的不同
```javascript
function test(){
  var a = 10;
  function baz(){
    console.log(a);
  }
  baz();
}
```
```javascript
function test(){
  var a = 10;
  return function baz(){
   console.log(a);
  }
}
var sss = test();
```
