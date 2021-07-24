export interface iGateway {
  _id?: number,
  name: string,
  ipv4: string,
  devices?: [{
      vendor: String,
      created: Date,
      online: Boolean,
    }
  ]
};
