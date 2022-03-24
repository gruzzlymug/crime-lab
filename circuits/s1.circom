pragma circom 2.0.0;

template Suggestion() {
    signal input hasMustard;
    signal input hasScarlet;
    signal input hasRope;
    signal input hasRevolver;
    signal input hasBilliard;
    signal input hasBallroom;
    signal input suspect;
    signal input weapon;
    signal input room;
    signal output out;

    signal isInRange;
    signal hasSuspect;
    signal hasWeapon;
    signal hasRoom;
    signal isDisproved;

    // validity check
    isInRange <-- (suspect >= 1 && suspect <= 6 && weapon >= 7 && weapon <= 12 && room >= 13 && room <= 21);
    isInRange === 1;

    // hand check
    hasSuspect <-- (suspect == 1 && hasMustard == 1) || (suspect == 2 && hasScarlet == 1);
    hasWeapon <-- (weapon == 7 && hasRope == 1) || (weapon == 12 && hasRevolver == 1);
    hasRoom <-- (room == 13 && hasBilliard == 1) || (room == 18 && hasBallroom == 1);

    isDisproved <-- (hasSuspect || hasWeapon || hasRoom);
    out <== isDisproved;
}

component main {public [suspect, weapon, room]} = Suggestion();
