#!/bin/zsh

circom ${@[1]}.circom --wasm
node ${@[1]}_js/generate_witness.js ${@[1]}_js/${@[1]}.wasm ${@[1]}_input.json witness.wtns
# proof
snarkjs groth16 prove ${@[1]}_0001.zkey witness.wtns proof.json public.json
snarkjs generatecall

