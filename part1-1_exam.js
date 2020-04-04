function foo(a) {//(3)a傳入foo函式的參數的參考LHS
    var b = a;//(4)a值的RHS參考為2, (5)b的LHS參考
    return a + b;//(6)a的RHS參考(7)b的RHS參考
}
var c = foo(2); //(1)foo的RHS參考為一個函式,(2)C的LHS參考