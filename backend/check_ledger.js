require('dotenv').config();
const fabricGateway = require('./fabricGateway');

async function main() {
    const batchID = process.argv[2];
    if (!batchID) {
        console.error("Please provide a batch ID. Usage: node check_ledger.js BATCH-001");
        process.exit(1);
    }

    try {
        console.log(`\nConnecting to Fabric Ledger...`);
        await fabricGateway.init();

        console.log(`\nQuerying immutable ledger history for: ${batchID}`);
        // evaluateTransaction queries the ledger directly without committing a new block
        const historyJson = await fabricGateway.evaluateTransaction('GetBatchHistory', batchID);
        
        console.log("\n================ LEDGER HISTORY ================\n");
        console.log(JSON.stringify(historyJson, null, 2));
        console.log("\n================================================\n");

        process.exit(0);
    } catch (error) {
        console.error("Failed to query ledger:", error);
        process.exit(1);
    }
}

main();
