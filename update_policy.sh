#!/bin/bash
cd ~/fabric-samples/test-network
./network.sh deployCC -ccn seed-tracking -ccp /mnt/c/Users/DELL/seed/blockchain/chaincode/seed-tracking -ccl javascript -ccep "OR('Org1MSP.peer','Org2MSP.peer')" -ccv 1.0 -ccs 1
