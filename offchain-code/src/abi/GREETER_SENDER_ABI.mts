export default [
    {
        "type": "constructor",
        "inputs": [
            {
                "name": "_greeterAddress",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "_greeterChainId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "messenger",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "contract IL2ToL2CrossDomainMessenger"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "setGreeting",
        "inputs": [
            {
                "name": "greeting",
                "type": "string",
                "internalType": "string"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    }
]