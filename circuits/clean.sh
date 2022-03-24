#!/bin/zsh

rm ${@[1]}.r1cs
rm ${@[1]}_000?.zkey
rm pot12_*.ptau
rm proof.json
rm public.json
rm verifier.sol
rm witness.wtns
rm -r ${@[1]}_js
