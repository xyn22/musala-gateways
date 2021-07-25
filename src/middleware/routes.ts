import express, { request, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

import GatewayModel from '../models/gateway';
import { iGateway, iDevice } from '../types/gateway';

export const router = express.Router();

const extractGatewayModelData = ((modelData: iGateway) => {
  return {
    id: modelData._id,
    name: modelData.name,
    ipv4: modelData.ipv4,
    devices: modelData.devices?.map(extractDeviceData),
  }
});

const extractDeviceData = ((device: iDevice) => {
  return {
    id: device._id,
    vendor: device.vendor,
    online: device.online,
    created: device.created,
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const gateways: iGateway[] = await GatewayModel.find();
    res.status(200).json(gateways.map(extractGatewayModelData));
  } catch (e) {
    console.error(e.message);
    res.status(500).send('error occured');
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const gateway: iGateway | null = await GatewayModel.findById(id);
    if (gateway) {
      res.status(200).json(extractGatewayModelData(gateway));
    } else {
      res.status(400).send('gateway not found');
    }
  } catch (e) {
    console.error(e.message);
    res.status(500).send('error occured');
  }
});


router.get('/:id/device', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const gateway: iGateway | null = await GatewayModel.findById(id);
    if (gateway) {
      res.status(200).json(gateway.devices ? gateway.devices.map(extractDeviceData) : []);
    } else {
      res.status(400).send('gateway not found');
    }
  } catch (e) {
    console.error(e.message);
    res.status(500).send('error occured');
  }
});

router.get('/:id/device/:deviceId', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const gateway: iGateway | null = await GatewayModel.findById(id);
    if (gateway) {
      const device: iDevice | undefined = gateway.devices?.find((device: iDevice) => device._id?.toString() === req.params.deviceId);
      if (device) {
        return res.status(200).json(extractDeviceData(device));
      } else {
      return res.status(400).send('device not found');
     }
    } else {
      return res.status(400).send('gateway not found');
    }
  } catch (e) {
    console.error(e.message);
    res.status(500).send('error occured');
  }
});

router.post('/',
  body('name').isLength({ min: 2, max: 20 }),
  body('ipv4').isIP(4),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, ipv4 } = req.body;
    const gatewayData = { name, ipv4 }
    const gatewayModel = new GatewayModel(gatewayData);
    try {
      await gatewayModel.save();
      res.status(200).json(gatewayModel._id);
    } catch(e) {
      console.error(e);
      return res.status(501).json({ error: ['server error'] });
    }
  },
);

router.post('/:id/device',
  body('vendor').isLength({ min: 2, max: 20 }),
  body('online').isBoolean(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { id } = req.params;
      const { vendor, online } = req.body;
      const gatewayModel = await GatewayModel.findById(id);
      if (!gatewayModel) {
        return res.status(400).send('gateway not found');
      }
      const max_devices = parseInt(process.env.MAX_DEVICES as any);
      if (gatewayModel.devices.length >= max_devices) {
        return res.status(400).send('gateway cannot have more than 10 devices');
      }
      const device: iDevice = {
        vendor,
        online,
        created: new Date(),
      };
      if (!gatewayModel.devices) {
        gatewayModel.devices = [];
      }
      gatewayModel.devices.push(device);
      
      await gatewayModel.save();
      res.status(200).json(gatewayModel.devices);
    
    } catch(e) {
      console.error(e);
      return res.status(501).json({ error: ['server error'] });
    }
  });


router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await GatewayModel.deleteOne({ _id: parseInt(req.params.id) });
    if (result.ok && result.deletedCount === 1 ) {
      return res.status(200).send('deleted');
    } else {
      return res.status(400).send('could not delete gateway');
    }
  } catch(e) {
    console.error(e);
    return res.status(400).send('could not delete gateway');
  }
})

router.delete('/:id/device/:deviceId', async (req: Request, res: Response) => {
  try {
    const gatewayModel = await GatewayModel.findById(parseInt(req.params.id));
    if (!gatewayModel) {
      return res.status(400).send('gateway not found');
    }
    const { devices } = gatewayModel;
    const index = devices.findIndex((device: iDevice) => device._id?.toString() === req.params.deviceId);
    if (index === -1) {
      return res.status(400).send('device not found');
    }
    devices.splice(index, 1);
    gatewayModel.markModified('devices');
    await gatewayModel.save();
    return res.status(200).send('device deleted');
  } catch(e) {
    console.error(e);
    return res.status(400).json({ error: ['could not delete device'] });
  }
})


router.put('/:id', 
  body('name')
    .if(body('name').exists())
      .isLength({ min: 2, max: 20 }),
  body('ipv4')
    .if(body('ipv4').exists())
      .isIP(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { body } = req;
    try {
      const gateway = await GatewayModel.findById(parseInt(req.params.id));
      if (!gateway) {
        return res.status(400).send('gateway not found');
      }
      if (body.name) {
        gateway.name = body.name;
      }
      
      if (body.ipv4) {
        gateway.ipv4 = body.ipv4;
      }
      await gateway.save();
      return res.status(200).json(extractGatewayModelData(gateway));
    } catch(e) {
      console.error(e);
      res.status(400).send('gateway could not be updated');
    }
})

router.put('/:id/device/:deviceId',
  body('vendor')
    .isLength({ min: 2, max: 20 }),
  body('online')
    .isBoolean(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { body } = req;
    try {
      const gatewayModel = await GatewayModel.findById(parseInt(req.params.id));
      if (!gatewayModel) {
        return res.status(400).send('gateway not found');
      }
      const device = gatewayModel.devices.find((device: iDevice) => device._id?.toString() === req.params.deviceId);
      if (!device) {
        return res.status(400).send('device not found');
      }

      
      device.vendor = body.vendor;
      device.online = body.online;
      gatewayModel.markModified('devices');
      await gatewayModel.save();
      return res.status(200).json(extractGatewayModelData(gatewayModel));
    } catch(e) {
      console.error(e);
      res.status(400).send('device could not be updated');
    }
})
