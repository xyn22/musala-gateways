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

beforeEach(async () => {
  await GatewayModel.deleteMany()
  return (GatewayModel as any)._resetCount();
});

describe('add gateway', () => {
  test('adds multiple gatweways with no devices', async () => {
    const sampleLength = 5;
    const gatewayData: iGateway[] = new Array<iGateway>();
    for (let i = 0; i < sampleLength; i++) {
      gatewayData.push({
        name: hacker.noun(),
        ipv4: internet.ip(),
        devices: [],
      });
    }

    await gatewayData.reduce<Promise<any>>(async (promise: Promise<any>, gateway: iGateway) => {
      const model = new GatewayModel(gateway);
      return promise.then(() => model.save());
    }, Promise.resolve());


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
    const gatewayData: iGateway = {
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

  test('fails when gateway has too many devices', async () => {
    const gatewayData: iGateway = {
      name: hacker.noun(),
      ipv4: internet.ip(),
      devices: [],
    };
    const max_devices = parseInt(process.env.MAX_DEVICES as any);
    for (let i = 0; i < max_devices + 1; i++) {
      gatewayData.devices?.push({
        vendor: company.companyName(),
        created: date.past(),
        online: datatype.boolean(),
      });
    }
    const gatewayModel = new GatewayModel(gatewayData);
    await expect(gatewayModel.save()).rejects.toThrowError(`devices exceeds the limit of ${max_devices}`);
  })
});


test('deletes a gatweway', async () => {
  const gatewayData = {
    name: hacker.noun(),
    ipv4: internet.ip(),
  };
  const gatewayModel = new GatewayModel(gatewayData);
  await gatewayModel.save();
  const added = await GatewayModel.findOne();
  expect(added).not.toBeNull();
  await added?.remove();
  const existing = await GatewayModel.findOne();
  expect(existing).toBeNull();
});

describe('modify gateway', () => {
  test('update name and ipv4', async () => {
    const gatewayData = {
      name: hacker.noun(),
      ipv4: internet.ip(),
    };
    const gatewayModel = new GatewayModel(gatewayData);
    await gatewayModel.save();
    const newName = hacker.noun();
    const newIP = internet.ip();

    gatewayModel.name = newName;
    gatewayModel.ipv4 = newIP;
    
    await gatewayModel.save();
    const modified = await GatewayModel.findOne();
    expect(modified).not.toBeNull();
    expect(modified?.name).toEqual(newName);
    expect(modified?.ipv4).toEqual(newIP);

  });

  test('modify devices', async () => {
    const gatewayData: iGateway = {
      name: hacker.noun(),
      ipv4: internet.ip(),
      devices: [],
    };
    
    for (let i = 0; i < 4; i++) {
      gatewayData.devices?.push({
        vendor: company.companyName(),
        created: date.past(),
        online: datatype.boolean(),
      });
    }
    const gatewayModel = new GatewayModel(gatewayData);
    await gatewayModel.save();
    const newVendor = company.companyName();
    const newDate = date.past();
    const newState = datatype.boolean();
    const { devices } = gatewayModel;
    expect(devices).not.toBeNull();
    if (!devices) return;
    devices[0].vendor = newVendor;
    devices[1].created = newDate;
    devices[2].online = newState;
    devices.splice(3, 1);
    gatewayModel.markModified('devices');
    await gatewayModel.save();
    const modified = await GatewayModel.findOne();
    expect(modified).not.toBeNull();
    if (!modified) return;
    expect(modified.devices && modified.devices[0].vendor).toStrictEqual(newVendor);
    expect(modified.devices && modified.devices[1].created).toStrictEqual(newDate);
    expect(modified.devices && modified.devices[2].online).toStrictEqual(newState);
    expect(modified.devices && modified.devices.length).toStrictEqual(3);
  });
})