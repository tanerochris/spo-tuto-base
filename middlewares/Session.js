import connectMongo from 'connect-mongo';
import { applySession, MemoryStore, Store, promisifyStore } from 'next-session';
import PropertiesReader from 'properties-reader';

const MongoStore = connectMongo({ Store, MemoryStore });
const properties = PropertiesReader('voxnostra.properties');
const mongoDbProp = 'project.app.mongodb.devUrl';
const mongooseUrl = process.env.MONGOB_URL || properties.get(mongoDbProp);

export const sessionOptions = {
  name: 'spo-tuto',
  store: promisifyStore(new MongoStore({ url: mongooseUrl }))
};

const Session = async ({ req, res }) => {
  await applySession(req, res, sessionOptions);
  return { req, res };
};

export default Session;
