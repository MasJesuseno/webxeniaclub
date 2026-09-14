#!/bin/bash
export SSHPASS='ninja-94$-panda'
sshpass -e ssh -o StrictHostKeyChecking=no ubuntu@43.129.43.213 "echo connected"
