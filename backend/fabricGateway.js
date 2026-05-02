const grpc = require('@grpc/grpc-js');
const { connect, signers } = require('@hyperledger/fabric-gateway');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

const channelName = process.env.CHANNEL_NAME || 'mychannel';
const chaincodeName = process.env.CHAINCODE_NAME || 'seed-tracking';
const mspId = process.env.MSP_ID || 'Org1MSP';

// Fallback to mocking if certificates are not provided yet.
// In a real environment, set these environment variables to the path of your certificates.
const cryptoPath = process.env.CRYPTO_PATH || path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com');

async function newGrpcConnection() {
    const tlsCertPath = path.resolve(cryptoPath, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt');
    const tlsRootCert = await fs.readFile(tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client('localhost:7051', tlsCredentials, {
        'grpc.ssl_target_name_override': 'peer0.org1.example.com',
    });
}

async function newIdentity() {
    const certPath = path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'signcerts', 'cert.pem');
    const credentials = await fs.readFile(certPath);
    return { mspId, credentials };
}

async function newSigner() {
    const keyDirectoryPath = path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'keystore');
    const files = await fs.readdir(keyDirectoryPath);
    const keyPath = path.resolve(keyDirectoryPath, files[0]);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}

class FabricService {
    constructor() {
        this.gateway = null;
        this.contract = null;
        this.isMock = process.env.MOCK_BLOCKCHAIN === 'true';
    }

    async init() {
        if (this.isMock) {
            console.log("Running in MOCK blockchain mode.");
            return;
        }

        try {
            const client = await newGrpcConnection();
            this.gateway = connect({
                client,
                identity: await newIdentity(),
                signer: await newSigner(),
                evaluateOptions: () => {
                    return { deadline: Date.now() + 5000 }; 
                },
                endorseOptions: () => {
                    return { deadline: Date.now() + 15000 };
                },
                submitOptions: () => {
                    return { deadline: Date.now() + 5000 };
                },
                commitStatusOptions: () => {
                    return { deadline: Date.now() + 60000 };
                },
            });

            const network = this.gateway.getNetwork(channelName);
            this.contract = network.getContract(chaincodeName);
            console.log("Connected to Fabric Gateway Successfully!");
        } catch (error) {
            console.error("Failed to connect to Fabric Gateway:", error);
            console.log("Switching to MOCK blockchain mode.");
            this.isMock = true;
        }
    }

    async submitTransaction(functionName, ...args) {
        if (this.isMock) {
            console.log(`[MOCK BLOCKCHAIN] Submitting ${functionName} with args:`, args);
            // Mock responses for standard functions
            if (functionName === 'CreateBatch' || functionName === 'ApproveBatch' || functionName === 'TransferBatch' || functionName === 'ReceiveBatch' || functionName === 'RecallBatch' || functionName === 'MarkExpired') {
                return JSON.stringify({ batchID: args[0], status: 'Success (Mock)', mock: true });
            }
            if (functionName === 'SplitBatch') {
                return JSON.stringify({ parent: { batchID: args[0] }, subBatches: [], mock: true });
            }
            return JSON.stringify({ success: true, mock: true });
        }

        try {
            const resultBytes = await this.contract.submitTransaction(functionName, ...args);
            const resultJson = new TextDecoder().decode(resultBytes);
            return resultJson ? JSON.parse(resultJson) : null;
        } catch (error) {
            console.error(`Error submitting transaction ${functionName}:`, error);
            throw error;
        }
    }

    async evaluateTransaction(functionName, ...args) {
        if (this.isMock) {
            console.log(`[MOCK BLOCKCHAIN] Evaluating ${functionName} with args:`, args);
            if (functionName === 'GetBatch') {
                return JSON.stringify({ batchID: args[0], cropDetails: 'Mock Crop', quantity: 100, owner: 'Mock Owner', status: 'Mock Status', mock: true });
            }
            if (functionName === 'GetBatchHistory') {
                return JSON.stringify([{ action: 'MockAction', timestamp: new Date().toISOString() }]);
            }
            return JSON.stringify({ success: true, mock: true });
        }

        try {
            const resultBytes = await this.contract.evaluateTransaction(functionName, ...args);
            const resultJson = new TextDecoder().decode(resultBytes);
            return resultJson ? JSON.parse(resultJson) : null;
        } catch (error) {
            console.error(`Error evaluating transaction ${functionName}:`, error);
            throw error;
        }
    }
}

const fabricService = new FabricService();
module.exports = fabricService;
