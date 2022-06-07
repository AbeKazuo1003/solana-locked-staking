export type ChicksStakingLocked = {
  "version": "0.1.0",
  "name": "chicks_staking_locked",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "initializer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakingAccountV3",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nonceVault",
          "type": "u8"
        },
        {
          "name": "nonceStakingV3",
          "type": "u8"
        },
        {
          "name": "poolHandle",
          "type": "string"
        },
        {
          "name": "rewardRate",
          "type": "u64"
        },
        {
          "name": "lockTime",
          "type": "u64"
        },
        {
          "name": "unlockInterval",
          "type": "u64"
        }
      ]
    },
    {
      "name": "migrateV3",
      "accounts": [
        {
          "name": "initializer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stakingAccountV2",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakingAccountV3",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nonceStakingV2",
          "type": "u8"
        },
        {
          "name": "nonceStakingV3",
          "type": "u8"
        },
        {
          "name": "poolHandle",
          "type": "string"
        },
        {
          "name": "rewardRate",
          "type": "u64"
        },
        {
          "name": "unlockInterval",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateConfig",
      "accounts": [
        {
          "name": "initializer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stakingAccountV3",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nonceStakingV3",
          "type": "u8"
        },
        {
          "name": "poolHandle",
          "type": "string"
        },
        {
          "name": "newLockTime",
          "type": "u64"
        },
        {
          "name": "newUnlockInterval",
          "type": "u64"
        },
        {
          "name": "newRewardRate",
          "type": "u64"
        }
      ]
    },
    {
      "name": "toggleFreezeProgram",
      "accounts": [
        {
          "name": "initializer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stakingAccountV3",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nonceStakingV3",
          "type": "u8"
        },
        {
          "name": "poolHandle",
          "type": "string"
        }
      ]
    },
    {
      "name": "depositReward",
      "accounts": [
        {
          "name": "tokenFromAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenFrom",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakingAccountV3",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nonceVault",
          "type": "u8"
        },
        {
          "name": "nonceStakingV3",
          "type": "u8"
        },
        {
          "name": "poolHandle",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initUserStake",
      "accounts": [
        {
          "name": "userAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userStakingAccountV3",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakingAccountV3",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nonceStakingV3",
          "type": "u8"
        },
        {
          "name": "poolHandle",
          "type": "string"
        },
        {
          "name": "handle",
          "type": "string"
        }
      ]
    },
    {
      "name": "stake",
      "accounts": [
        {
          "name": "tokenFromAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenFrom",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakingAccountV3",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userStakingAccountV3",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nonceVault",
          "type": "u8"
        },
        {
          "name": "nonceStakingV3",
          "type": "u8"
        },
        {
          "name": "nonceUserStakingV3",
          "type": "u8"
        },
        {
          "name": "poolHandle",
          "type": "string"
        },
        {
          "name": "handle",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "convertUserStakeAccount",
      "accounts": [
        {
          "name": "userAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stakingAccountV3",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userStakingAccountV2",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userStakingAccountV3",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nonceStakingV3",
          "type": "u8"
        },
        {
          "name": "nonceUserStakingV2",
          "type": "u8"
        },
        {
          "name": "nonceUserStakingV3",
          "type": "u8"
        },
        {
          "name": "poolHandle",
          "type": "string"
        },
        {
          "name": "handle",
          "type": "string"
        }
      ]
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "tokenToAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakingAccountV3",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userStakingAccountV3",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenTo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nonceVault",
          "type": "u8"
        },
        {
          "name": "nonceStakingV3",
          "type": "u8"
        },
        {
          "name": "nonceUserStakingV3",
          "type": "u8"
        },
        {
          "name": "poolHandle",
          "type": "string"
        },
        {
          "name": "handle",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "stakingAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initializerKey",
            "type": "publicKey"
          },
          {
            "name": "lockTime",
            "type": "u64"
          },
          {
            "name": "totalToken",
            "type": "u64"
          },
          {
            "name": "totalXToken",
            "type": "u64"
          },
          {
            "name": "freezeProgram",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "stakingAccountV3",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initializerKey",
            "type": "publicKey"
          },
          {
            "name": "tokenAddress",
            "type": "publicKey"
          },
          {
            "name": "lockTime",
            "type": "u64"
          },
          {
            "name": "unlockInterval",
            "type": "u64"
          },
          {
            "name": "totalStakedAmount",
            "type": "u64"
          },
          {
            "name": "remainRewardAmount",
            "type": "u64"
          },
          {
            "name": "rewardRate",
            "type": "u64"
          },
          {
            "name": "freezeProgram",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "userStakingAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "startTime",
            "type": "u64"
          },
          {
            "name": "xTokenAmount",
            "type": "u64"
          },
          {
            "name": "rewards",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "userStakingAccountV3",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "startTime",
            "type": "u64"
          },
          {
            "name": "stakedAmount",
            "type": "u64"
          },
          {
            "name": "rewardAmount",
            "type": "u64"
          },
          {
            "name": "claimedAmount",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "Reward",
      "fields": [
        {
          "name": "deposit",
          "type": "u64",
          "index": false
        },
        {
          "name": "reward",
          "type": "u64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NotExceedLockEndDate",
      "msg": "Not exceed lock end date"
    },
    {
      "code": 6001,
      "name": "InvalidRequest",
      "msg": "Invalid request"
    },
    {
      "code": 6002,
      "name": "PermissionError",
      "msg": "Invalid action"
    },
    {
      "code": 6003,
      "name": "InternalError",
      "msg": "Internal error"
    }
  ]
};

export const IDL: ChicksStakingLocked = {
  "version": "0.1.0",
  "name": "chicks_staking_locked",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "initializer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakingAccountV3",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nonceVault",
          "type": "u8"
        },
        {
          "name": "nonceStakingV3",
          "type": "u8"
        },
        {
          "name": "poolHandle",
          "type": "string"
        },
        {
          "name": "rewardRate",
          "type": "u64"
        },
        {
          "name": "lockTime",
          "type": "u64"
        },
        {
          "name": "unlockInterval",
          "type": "u64"
        }
      ]
    },
    {
      "name": "migrateV3",
      "accounts": [
        {
          "name": "initializer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stakingAccountV2",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakingAccountV3",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nonceStakingV2",
          "type": "u8"
        },
        {
          "name": "nonceStakingV3",
          "type": "u8"
        },
        {
          "name": "poolHandle",
          "type": "string"
        },
        {
          "name": "rewardRate",
          "type": "u64"
        },
        {
          "name": "unlockInterval",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateConfig",
      "accounts": [
        {
          "name": "initializer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stakingAccountV3",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nonceStakingV3",
          "type": "u8"
        },
        {
          "name": "poolHandle",
          "type": "string"
        },
        {
          "name": "newLockTime",
          "type": "u64"
        },
        {
          "name": "newUnlockInterval",
          "type": "u64"
        },
        {
          "name": "newRewardRate",
          "type": "u64"
        }
      ]
    },
    {
      "name": "toggleFreezeProgram",
      "accounts": [
        {
          "name": "initializer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stakingAccountV3",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nonceStakingV3",
          "type": "u8"
        },
        {
          "name": "poolHandle",
          "type": "string"
        }
      ]
    },
    {
      "name": "depositReward",
      "accounts": [
        {
          "name": "tokenFromAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenFrom",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakingAccountV3",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nonceVault",
          "type": "u8"
        },
        {
          "name": "nonceStakingV3",
          "type": "u8"
        },
        {
          "name": "poolHandle",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initUserStake",
      "accounts": [
        {
          "name": "userAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userStakingAccountV3",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakingAccountV3",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nonceStakingV3",
          "type": "u8"
        },
        {
          "name": "poolHandle",
          "type": "string"
        },
        {
          "name": "handle",
          "type": "string"
        }
      ]
    },
    {
      "name": "stake",
      "accounts": [
        {
          "name": "tokenFromAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenFrom",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakingAccountV3",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userStakingAccountV3",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nonceVault",
          "type": "u8"
        },
        {
          "name": "nonceStakingV3",
          "type": "u8"
        },
        {
          "name": "nonceUserStakingV3",
          "type": "u8"
        },
        {
          "name": "poolHandle",
          "type": "string"
        },
        {
          "name": "handle",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "convertUserStakeAccount",
      "accounts": [
        {
          "name": "userAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stakingAccountV3",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userStakingAccountV2",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userStakingAccountV3",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nonceStakingV3",
          "type": "u8"
        },
        {
          "name": "nonceUserStakingV2",
          "type": "u8"
        },
        {
          "name": "nonceUserStakingV3",
          "type": "u8"
        },
        {
          "name": "poolHandle",
          "type": "string"
        },
        {
          "name": "handle",
          "type": "string"
        }
      ]
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "tokenToAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakingAccountV3",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userStakingAccountV3",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenTo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nonceVault",
          "type": "u8"
        },
        {
          "name": "nonceStakingV3",
          "type": "u8"
        },
        {
          "name": "nonceUserStakingV3",
          "type": "u8"
        },
        {
          "name": "poolHandle",
          "type": "string"
        },
        {
          "name": "handle",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "stakingAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initializerKey",
            "type": "publicKey"
          },
          {
            "name": "lockTime",
            "type": "u64"
          },
          {
            "name": "totalToken",
            "type": "u64"
          },
          {
            "name": "totalXToken",
            "type": "u64"
          },
          {
            "name": "freezeProgram",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "stakingAccountV3",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initializerKey",
            "type": "publicKey"
          },
          {
            "name": "tokenAddress",
            "type": "publicKey"
          },
          {
            "name": "lockTime",
            "type": "u64"
          },
          {
            "name": "unlockInterval",
            "type": "u64"
          },
          {
            "name": "totalStakedAmount",
            "type": "u64"
          },
          {
            "name": "remainRewardAmount",
            "type": "u64"
          },
          {
            "name": "rewardRate",
            "type": "u64"
          },
          {
            "name": "freezeProgram",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "userStakingAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "startTime",
            "type": "u64"
          },
          {
            "name": "xTokenAmount",
            "type": "u64"
          },
          {
            "name": "rewards",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "userStakingAccountV3",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "startTime",
            "type": "u64"
          },
          {
            "name": "stakedAmount",
            "type": "u64"
          },
          {
            "name": "rewardAmount",
            "type": "u64"
          },
          {
            "name": "claimedAmount",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "Reward",
      "fields": [
        {
          "name": "deposit",
          "type": "u64",
          "index": false
        },
        {
          "name": "reward",
          "type": "u64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NotExceedLockEndDate",
      "msg": "Not exceed lock end date"
    },
    {
      "code": 6001,
      "name": "InvalidRequest",
      "msg": "Invalid request"
    },
    {
      "code": 6002,
      "name": "PermissionError",
      "msg": "Invalid action"
    },
    {
      "code": 6003,
      "name": "InternalError",
      "msg": "Internal error"
    }
  ]
};
