#!/bin/zsh

circom ${@[1]}.circom --r1cs --wasm
node ${@[1]}_js/generate_witness.js ${@[1]}_js/${@[1]}.wasm ${@[1]}_input.json witness.wtns
# ptau
snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v
# z key
snarkjs groth16 setup ${@[1]}.r1cs pot12_final.ptau ${@[1]}_0000.zkey
snarkjs zkey contribute ${@[1]}_0000.zkey ${@[1]}_0001.zkey --name="1st Contributor Name" -v
# proof
snarkjs groth16 prove ${@[1]}_0001.zkey witness.wtns proof.json public.json
snarkjs generatecall
# verifier
snarkjs zkey export solidityverifier ${@[1]}_0001.zkey verifier.sol

