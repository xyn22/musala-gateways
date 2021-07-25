export interface iGateway {
  _id?: number,
  name: string,
  ipv4: string,
  devices: iDevice[],
};

export interface iDevice {
  _id?: string,
  vendor: string,
  created: Date,
  online: boolean,
}