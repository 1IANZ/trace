export type Trace = {
  "address": "6gfJUBVCHqY1JRPx9g8mJnSXJFoDwWwbsMWwRg7uNjdQ",
  "metadata": {
    "name": "trace",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addUserToWhitelist",
      "discriminator": [
        244,
        177,
        124,
        12,
        22,
        50,
        139,
        152
      ],
      "accounts": [
        {
          "name": "whitelistAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  104,
                  105,
                  116,
                  101,
                  108,
                  105,
                  115,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "userToAdd",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "appendRecord",
      "discriminator": [
        74,
        169,
        62,
        27,
        47,
        32,
        95,
        76
      ],
      "accounts": [
        {
          "name": "traceAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  97,
                  99,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "trace_account.product_id",
                "account": "traceAccount"
              }
            ]
          }
        },
        {
          "name": "whitelistAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  104,
                  105,
                  116,
                  101,
                  108,
                  105,
                  115,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "user",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "step",
          "type": "string"
        },
        {
          "name": "location",
          "type": "string"
        },
        {
          "name": "actor",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        }
      ]
    },
    {
      "name": "clear",
      "discriminator": [
        250,
        39,
        28,
        213,
        123,
        163,
        133,
        5
      ],
      "accounts": [
        {
          "name": "traceAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  97,
                  99,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "trace_account.product_id",
                "account": "traceAccount"
              }
            ]
          }
        },
        {
          "name": "whitelistAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  104,
                  105,
                  116,
                  101,
                  108,
                  105,
                  115,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "user",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "delete",
      "discriminator": [
        165,
        204,
        60,
        98,
        134,
        15,
        83,
        134
      ],
      "accounts": [
        {
          "name": "traceAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  97,
                  99,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "trace_account.product_id",
                "account": "traceAccount"
              }
            ]
          }
        },
        {
          "name": "whitelistAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  104,
                  105,
                  116,
                  101,
                  108,
                  105,
                  115,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "user",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u64"
        }
      ]
    },
    {
      "name": "getTrace",
      "discriminator": [
        162,
        243,
        83,
        76,
        81,
        40,
        50,
        32
      ],
      "accounts": [
        {
          "name": "traceAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  97,
                  99,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "trace_account.product_id",
                "account": "traceAccount"
              }
            ]
          }
        }
      ],
      "args": [],
      "returns": {
        "defined": {
          "name": "traceInfo"
        }
      }
    },
    {
      "name": "initTrace",
      "discriminator": [
        133,
        45,
        224,
        207,
        140,
        102,
        110,
        23
      ],
      "accounts": [
        {
          "name": "traceAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  97,
                  99,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "productId"
              }
            ]
          }
        },
        {
          "name": "whitelistAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  104,
                  105,
                  116,
                  101,
                  108,
                  105,
                  115,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "productId",
          "type": "string"
        }
      ]
    },
    {
      "name": "initWhitelist",
      "discriminator": [
        103,
        193,
        162,
        241,
        234,
        97,
        110,
        71
      ],
      "accounts": [
        {
          "name": "whitelistAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  104,
                  105,
                  116,
                  101,
                  108,
                  105,
                  115,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "removeUserFromWhitelist",
      "discriminator": [
        198,
        73,
        139,
        218,
        243,
        209,
        180,
        182
      ],
      "accounts": [
        {
          "name": "whitelistAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  104,
                  105,
                  116,
                  101,
                  108,
                  105,
                  115,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "userToRemove",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "updateRecord",
      "discriminator": [
        54,
        194,
        108,
        162,
        199,
        12,
        5,
        60
      ],
      "accounts": [
        {
          "name": "traceAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  97,
                  99,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "trace_account.product_id",
                "account": "traceAccount"
              }
            ]
          }
        },
        {
          "name": "whitelistAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  104,
                  105,
                  116,
                  101,
                  108,
                  105,
                  115,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "user",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u64"
        },
        {
          "name": "newStep",
          "type": "string"
        },
        {
          "name": "newLocation",
          "type": "string"
        },
        {
          "name": "newActor",
          "type": "string"
        },
        {
          "name": "newDescription",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "traceAccount",
      "discriminator": [
        153,
        32,
        65,
        100,
        169,
        62,
        110,
        137
      ]
    },
    {
      "name": "whitelistAccount",
      "discriminator": [
        220,
        23,
        250,
        64,
        154,
        251,
        129,
        36
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidIndex",
      "msg": "Invalid index"
    },
    {
      "code": 6001,
      "name": "unauthorizedUser",
      "msg": "Unauthorized user"
    },
    {
      "code": 6002,
      "name": "unauthorizedAdmin",
      "msg": "Unauthorized admin"
    }
  ],
  "types": [
    {
      "name": "traceAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "productId",
            "type": "string"
          },
          {
            "name": "records",
            "type": {
              "vec": {
                "defined": {
                  "name": "traceRecord"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "traceInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "productId",
            "type": "string"
          },
          {
            "name": "records",
            "type": {
              "vec": {
                "defined": {
                  "name": "traceRecord"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "traceRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ts",
            "type": "i64"
          },
          {
            "name": "step",
            "type": "string"
          },
          {
            "name": "location",
            "type": "string"
          },
          {
            "name": "actor",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "whitelistAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "whitelistedUsers",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    }
  ]
};
