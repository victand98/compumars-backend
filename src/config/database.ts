import mongoose from "mongoose";
import config from "config";
import log from "./logger";

const connect = async () => {
  try {
    const dbUri = config.get("dbUri") as string;
    await mongoose.connect(dbUri);
    log.info(`Database is connected`);
  } catch (error) {
    log.error(`Database connection error: ${error}`);
    process.exit(1);
  }
};

export default connect;
