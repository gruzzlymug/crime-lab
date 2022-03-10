pragma circom 2.0.3;

include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/gates.circom";

// out
   // 1: choice is valid
   // 0: choice is not valid
template makeChoice () {  

   // Declaration of signals.  
   signal input choice;  
   signal output out;

   // Constraints.  
   component lt3 = LessThan(32);
   lt3.in[0] <== choice;
   lt3.in[1] <== 3;

   component gtEq = GreaterEqThan(32);
   gtEq.in[0] <== choice;
   gtEq.in[1] <== 0;

   component and1 = AND();
   and1.a <== lt3.out;
   and1.b <== gtEq.out;

   component eq = IsEqual();
   eq.in[0] <== and1.out;
   eq.in[1] <== 1;

   out <== eq.out;
}

component main = makeChoice();
