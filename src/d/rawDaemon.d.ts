type Inputs = {
    data: {
        input: {
            amount: number,
            k_image: string,
            key_offsets: number[],
            mixin: number
        },
        output: {
            number: number, 
            transactionHash: string
        },
        type: string
    }
}

type Outputs = {
    globalIndex: number, 
    output: {
        amount: 0,
        target: {
            data: {
                key: string
            }
        }
    }
}

type Extra = {
    nonce: number[],
    publicKey: string,
    raw: string
}

type RawDaemonTransaction = {
    extra: Extra,
    outputs: Outputs[],
    inputs: Inputs[],
    fee : number,
    unlockTime: number,
    global_index_start?: number,
    height?: number,
    timestamp?: number
    hash?: string,
    paymentId: string
};

type RawDaemonBlock = any;