/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/trace.json`.
 */
export type Trace = {
  "address": "9VEMBenFkotjdBVsJXEBdsSLfc3Ao3fihsrL1TaqK5wu",
  "metadata": {
    "name": "trace",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
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
          "name": "user",
          "signer": true
        }
      ],
      "args": [
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
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidIndex",
      "msg": "Invalid index"
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
            "name": "description",
            "type": "string"
          }
        ]
      }
    }
  ]
};