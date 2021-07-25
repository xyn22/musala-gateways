import dotenv from 'dotenv';
import mongoose from 'mongoose';
import request from "supertest";
import { Server } from "http";
import { company, internet, hacker, date, datatype } from "faker";
import path from "path";

const result = dotenv.config({ path: path.resolve(__dirname, '../test.env') });
if (result.error) {
  throw "test.env does not exist";
}

import app from "../src/server";
const PORT: number = parseInt(process.env.PORT as string, 10);
let server: Server;
mongoose
  .connect(
    process.env.MONGO_URI as string,
    { useNewUrlParser: true }
  )
  .catch(console.error);

beforeAll(done => {
  server = app.listen(PORT, async () => {
    done();
  })
  .on("error", err => {
    console.error(err);
    done(err);
  });
})

afterAll(() => {
  return server.close();
})

describe('GET /gateway', function() {
  it('responds with json', function(done) {
    request(app)
      .get('/gateway')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        return done();
      });
  });
});


describe('gateway CRUD', function() {
  it('adds, modifies and deletes gateway', async () => {
    let response = await request(app)
      .post('/gateway')
      .send({
        name: hacker.noun().substr(0, 20),
        ipv4: internet.ip(),
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(typeof response.body).toBe('number');
    const id = response.body;

    const newName = company.companyName().substr(0, 20);
    const newIP = internet.ip();

    response = await request(app)
      .put(`/gateway/${id}`)
      .send({
        name: newName,
        ipv4: newIP,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).toMatchObject({
        name: newName,
        ipv4: newIP,
    })

    response = await request(app)
      .delete(`/gateway/${id}`)
      .expect(200)
      
    expect(response.text).toEqual('deleted');
  });
});


describe('gateway devices CRUD', function() {
  it('adds gateway with a device', async () => {
    let response = await request(app)
      .post('/gateway')
      .send({
        name:  hacker.noun().substr(0, 20),
        ipv4: internet.ip(),
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(typeof response.body).toBe('number');
    const id = response.body;
    expect(typeof id).toBe('number');
    const vendor = 
    response = await request(app)
      .post(`/gateway/${id}/device`)
      .send({
        vendor:  company.companyName().substr(0, 20),
        online: datatype.boolean(),
      })
      .expect('Content-Type', /json/)
      .expect(200)
  });
});
