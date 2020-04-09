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