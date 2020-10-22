import mongoose from 'mongoose';
import path from 'path';
import PropertiesReader from 'properties-reader';
// import '../models/all';

const properties = PropertiesReader(path.resolve('voxnostra.properties'));
const mongoDbProp = 'project.app.mongodb.devUrl';
const mongooseUrl = process.env.MONGOB_URL || properties.get(mongoDbProp);

const Database = async ({ req, res }) => {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(mongooseUrl, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true
    });
    // fixme: here we log connection errors and retries
    // eslint-disable-next-line no-console
    mongoose.connection.on('error', (error) => console.error(error));
  }
  const httpReqRes = { req, res };
  return httpReqRes;
};

export default Database;
