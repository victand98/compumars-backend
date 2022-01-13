import nodemailer from "nodemailer";
import config from "config";
import { MailOptions } from "nodemailer/lib/json-transport";

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: config.get<string>("emailUser"),
    pass: config.get<string>("emailPassword"),
  },
});

export const sendMail = (mailOptions: MailOptions) => {
  const defaultMailOptions: MailOptions = {
    from: '"Compumars" <compumars@example.com>', // sender address
    subject: "COMPUMARS", // Subject line
  };
  return transporter.sendMail({ ...defaultMailOptions, ...mailOptions });
};

export default transporter;
