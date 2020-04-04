# 你所不知道的JS
[TOC]
# Part1-1 範疇與Closures篇
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
## function decoration與function statement的不同
* function foo(a)：函式宣告式(function decoration)
* var a; a = function：函式陳述句(function statement)這裡的var a是`Compiler`去請`Scope`定義的
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