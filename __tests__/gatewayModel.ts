import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from "path";
import { company, internet, hacker, date, datatype } from "faker";
import GatewayModel from '../src/models/gateway';
import { iGateway } from '../src/types/gateway';

const result = dotenv.config({ path: path.resolve(__dirname, '../test.env') });
if (result.error) {
  throw "test.env does not exist";
}

beforeAll(() => {
  return mongoose
  .connect(
    process.env.MONGO_URI as string,
    { useNewUrlParser: true }
  )
  .catch(err => console.log(err));
});

beforeEach(() => {
  return (GatewayModel as any)._resetCount();
});

afterEach(() => GatewayModel.deleteMany());

describe('gateway model', () => {
  test('adds multiple gatweways with no devices', async () => {
    const sampleLength = 5;
    const gatewayData: iGateway[] = new Array<iGateway>();
    for (let i = 0; i < sampleLength; i++) {
      gatewayData.push({
        name: hacker.noun(),
        ipv4: internet.ip(),
      });
    }
    await Promise.all(gatewayData.map(gateway => {
      const model = new GatewayModel(gateway);
      return model.save();
    }));

    const added = await GatewayModel.find().sort({ _id: 'asc'});
    expect(Array.isArray(added)).toBeTruthy();
    expect(added.length).toStrictEqual(sampleLength);
    added.forEach((gateway: any, index: number) => {
      const gatewayDoc: iGateway = gateway.toJSON();
      expect(gatewayDoc).toMatchObject(gatewayData[index]);
      expect(gatewayDoc._id).toStrictEqual(index + 1);
    });
  });

  test('adds new gatweway with a device', async () => {
    const gatewayData = {
      name: hacker.noun(),
      ipv4: internet.ip(),
      devices: [{
        vendor: company.companyName(),
        created: date.past(),
        online: datatype.boolean(),
      }],
    };
    const gatewayModel = new GatewayModel(gatewayData);
    const spy = jest.spyOn(gatewayModel, "save");
    await gatewayModel.save();
    const added = await GatewayModel.findOne();
    expect(added).not.toBeNull();
    if (added) {
      const gatewayDoc: iGateway = added.toJSON();
      expect(gatewayDoc).toMatchObject(gatewayData);
      expect(gatewayDoc._id).toStrictEqual(1);
      expect(gatewayDoc.devices?.length).toStrictEqual(1);
    }
  })

  test('deletes a gatweway', async () => {
    const gatewayData = {
      name: hacker.noun(),
      ipv4: internet.ip(),
    };
    const gatewayModel = new GatewayModel(gatewayData);
    await gatewayModel.save();
    const added = await GatewayModel.findOne();
    expect(added).not.toBeNull();
    const gatewayDoc = added?.toJSON();
    expect(gatewayDoc).not.toBeNull();
    gatewayDoc && expect(gatewayDoc).toMatchObject(gatewayData);
    gatewayDoc && expect(gatewayDoc._id).toStrictEqual(1);
  })
})