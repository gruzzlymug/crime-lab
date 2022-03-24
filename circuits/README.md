# Circuits

This directory contains zero knowledge proofs using circuits written with the Circom language.

If you have not yet compiled circuits locally, start [here](https://docs.circom.io/getting-started/installation/).

## Suggestion Version 1

`s1` is a circuit that a player can use to disprove a suggestion without revealing which card(s) in their hand contradict the suggestion.

**Private Input**

* List of cards held

**Public Input**

* Suspect
* Weapon
* Room

**Output**

* True: the suggestion is disproved
* False: the suggestion can't be disproved by cards in hand

## Suggestion Version 2

`s2` will be a circuit that a player can use to prove they have a particular card without revealing any other information about the hand.

**Private Input**

* List of cards held

**Public Input**

* Suspect
* Weapon
* Room

**Output**

* Number in range
  * 0 - No card held
  * 1 - Suspect card held
  * 2 - Weapon card held
  * 3 - Room card held

To Be Developed...

### Building Everything
```zsh
./gen_all.sh s1
```

### Building only the Call Params
```zsh
./gen_cp.sh s1
```

### Input Example

The **raw input** going into the proof contains both public and private signals.

```
{
    "hasMustard": 0,
    "hasScarlet": 1,
    "hasRope": 0,
    "hasRevolver": 1,
    "hasBilliard": 0,
    "hasBallroom": 1,
    "suspect": 2,
    "weapon": 11,
    "room": 15
}
```

### Call Params Example

The call parameters encrypt the private signals, but not the public signals. Note that the last 4 values are the output and the public input.

In this case:

**Out**

* True: suggestion disproved

**Public Input**

* Suspect is Card 2, Scarlet
* Weapon is Card 11, Candlestick
* Room is Card 15, Hall

```
["0x294304f4a7dc0be4fb840309b35b0eb843053d828dc7eabb4187a244ed78f30d", "0x1c5b3cc4107746a03581ee615dcadbba2ccb8e55a024dda44699ed6a16c99109"],[["0x0018e962b845448a0eaf339b9299296760ef79a059a5654527d983f4c7e1e71e", "0x008e148cc2be3ed53a69efe06d1f9dab04217f7593e2cdb0fb88ec55a78e52af"],["0x0c57f7e4bff5f5ada65d9213d2e222dba1dcf79abcc313b4eac47b106f8b02c7", "0x1d36076065458f50d309a1aeb8d8ddcbe582bf6f0f42b92461b6c0443f512daf"]],["0x221048c17539b22c91ea432d31917f70deeb7127c2bbce8f93eebc6b52c2fe55", "0x2f6171a80e7a5d41bf183af3471ced950924e21e73a055d7c5357cda9907863a"],["0x0000000000000000000000000000000000000000000000000000000000000001","0x0000000000000000000000000000000000000000000000000000000000000002","0x000000000000000000000000000000000000000000000000000000000000000b","0x000000000000000000000000000000000000000000000000000000000000000f"]
```

### Cleaning
```zsh
./clean.sh s1
```