'use strict';

const { Contract } = require('fabric-contract-api');

class SeedContract extends Contract {

    // 1. Producer Creates Batch
    async CreateBatch(ctx, batchID, cropDetails, quantity, dateOfProduction, dateOfExpiry, producerId, ownerName) {
        const batchExists = await this.BatchExists(ctx, batchID);
        if (batchExists) {
            throw new Error(`The batch ${batchID} already exists`);
        }

        const batch = {
            batchID,
            cropDetails,
            quantity: parseFloat(quantity),
            dateOfProduction,
            dateOfExpiry,
            producerId,
            owner: ownerName,
            status: 'Created',
            history: [{
                action: 'CreateBatch',
                timestamp: new Date().toISOString(),
                actorId: producerId,
                actorName: ownerName
            }]
        };

        await ctx.stub.putState(batchID, Buffer.from(JSON.stringify(batch)));
        return JSON.stringify(batch);
    }

    // 2. Producer Sends to Lab
    async SendToLab(ctx, batchID, labId, actorId, actorName) {
        const batch = await this._getBatch(ctx, batchID);
        batch.status = 'Sent to Lab';
        batch.labId = labId;
        batch.history.push({
            action: 'SendToLab',
            timestamp: new Date().toISOString(),
            actorId,
            actorName,
            details: `Sent to Lab ID ${labId}`
        });
        await ctx.stub.putState(batchID, Buffer.from(JSON.stringify(batch)));
        return JSON.stringify(batch);
    }

    // 3. Lab Confirms Receipt
    async ReceiveAtLab(ctx, batchID, actorId, actorName) {
        const batch = await this._getBatch(ctx, batchID);
        batch.status = 'Received by Lab';
        batch.owner = actorName;
        batch.history.push({
            action: 'ReceiveAtLab',
            timestamp: new Date().toISOString(),
            actorId,
            actorName
        });
        await ctx.stub.putState(batchID, Buffer.from(JSON.stringify(batch)));
        return JSON.stringify(batch);
    }

    // 4a. Lab Certifies Batch
    async CertifyBatch(ctx, batchID, qualityGrade, pdfHash, actorId, actorName) {
        const batch = await this._getBatch(ctx, batchID);
        batch.status = 'Certified';
        batch.qualityGrade = qualityGrade;
        batch.pdfHash = pdfHash;
        batch.history.push({
            action: 'CertifyBatch',
            timestamp: new Date().toISOString(),
            actorId,
            actorName,
            details: `Grade: ${qualityGrade}, Hash: ${pdfHash}`
        });
        await ctx.stub.putState(batchID, Buffer.from(JSON.stringify(batch)));
        return JSON.stringify(batch);
    }

    // 4b. Lab Rejects Batch
    async RejectBatch(ctx, batchID, qualityGrade, pdfHash, actorId, actorName) {
        const batch = await this._getBatch(ctx, batchID);
        batch.status = 'Rejected';
        batch.qualityGrade = qualityGrade;
        batch.pdfHash = pdfHash;
        batch.history.push({
            action: 'RejectBatch',
            timestamp: new Date().toISOString(),
            actorId,
            actorName,
            details: `Rejected with Grade: ${qualityGrade}`
        });
        await ctx.stub.putState(batchID, Buffer.from(JSON.stringify(batch)));
        return JSON.stringify(batch);
    }

    // 5. Lab Dispatches to Transport
    async DispatchToTransport(ctx, batchID, transporterId, actorId, actorName) {
        const batch = await this._getBatch(ctx, batchID);
        batch.status = 'In Transport';
        batch.transporterId = transporterId;
        batch.history.push({
            action: 'DispatchToTransport',
            timestamp: new Date().toISOString(),
            actorId,
            actorName,
            details: `Dispatched to Transporter ID ${transporterId}`
        });
        await ctx.stub.putState(batchID, Buffer.from(JSON.stringify(batch)));
        return JSON.stringify(batch);
    }

    // 6. Transporter Updates Location
    async UpdateLocation(ctx, batchID, location, actorId, actorName) {
        const batch = await this._getBatch(ctx, batchID);
        batch.location = location;
        batch.history.push({
            action: 'UpdateLocation',
            timestamp: new Date().toISOString(),
            actorId,
            actorName,
            details: `Location updated to: ${location}`
        });
        await ctx.stub.putState(batchID, Buffer.from(JSON.stringify(batch)));
        return JSON.stringify(batch);
    }

    // 7. Warehouse Confirms Delivery
    async ReceiveAtWarehouse(ctx, batchID, actorId, actorName) {
        const batch = await this._getBatch(ctx, batchID);
        batch.status = 'With Warehouse';
        batch.warehouseId = actorId;
        batch.owner = actorName;
        batch.dateOfDelivery = new Date().toISOString().split('T')[0];
        batch.history.push({
            action: 'ReceiveAtWarehouse',
            timestamp: new Date().toISOString(),
            actorId,
            actorName
        });
        await ctx.stub.putState(batchID, Buffer.from(JSON.stringify(batch)));
        return JSON.stringify(batch);
    }

    // 8a. Warehouse Marks Sold
    async MarkSold(ctx, batchID, actorId, actorName) {
        const batch = await this._getBatch(ctx, batchID);
        batch.status = 'Sold to Farmer';
        batch.history.push({
            action: 'MarkSold',
            timestamp: new Date().toISOString(),
            actorId,
            actorName
        });
        await ctx.stub.putState(batchID, Buffer.from(JSON.stringify(batch)));
        return JSON.stringify(batch);
    }

    // 8b. Warehouse Marks Expired
    async MarkExpired(ctx, batchID, actorId, actorName) {
        const batch = await this._getBatch(ctx, batchID);
        batch.status = 'Expired';
        batch.history.push({
            action: 'MarkExpired',
            timestamp: new Date().toISOString(),
            actorId,
            actorName
        });
        await ctx.stub.putState(batchID, Buffer.from(JSON.stringify(batch)));
        return JSON.stringify(batch);
    }

    // Get batch details
    async GetBatch(ctx, batchID) {
        return await this._getBatch(ctx, batchID);
    }

    // Get full batch history
    async GetBatchHistory(ctx, batchID) {
        const iterator = await ctx.stub.getHistoryForKey(batchID);
        const allResults = [];
        let res = await iterator.next();
        while (!res.done) {
            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                jsonRes.txId = res.value.txId;
                jsonRes.timestamp = res.value.timestamp;
                try {
                    jsonRes.record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    jsonRes.record = res.value.value.toString('utf8');
                }
                allResults.push(jsonRes);
            }
            res = await iterator.next();
        }
        await iterator.close();
        return JSON.stringify(allResults);
    }

    // Internal helper to get batch
    async _getBatch(ctx, batchID) {
        const batchJSON = await ctx.stub.getState(batchID);
        if (!batchJSON || batchJSON.length === 0) {
            throw new Error(`The batch ${batchID} does not exist`);
        }
        return JSON.parse(batchJSON.toString());
    }

    // Helper to check existence
    async BatchExists(ctx, batchID) {
        const batchJSON = await ctx.stub.getState(batchID);
        return batchJSON && batchJSON.length > 0;
    }
}

module.exports = SeedContract;
