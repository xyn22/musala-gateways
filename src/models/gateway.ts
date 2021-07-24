import mongoose from 'mongoose';
import { MongooseAutoIncrementID } from 'mongoose-auto-increment-reworked';
import type { iGateway } from '../types/gateway';

const { Schema } = mongoose;
const gatewaySchema = new Schema<iGateway>({
  name: String,
  ipv4: String,
  devices: {
    type: 
      [{
        vendor: String,
        created: Date,
        online: Boolean,
      }],
    validate: [(a: any[]) => a.length <= 10, '{PATH} exceeds the limit of 10'],
  }
})

gatewaySchema.plugin(MongooseAutoIncrementID.plugin as any, { modelName: 'gateway' });
const GatewayModel = mongoose.model<iGateway>('gateway', gatewaySchema);

export default GatewayModel;