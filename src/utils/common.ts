import crypto from "crypto";
export const mysql_real_escape_string = (str: string) => {
  return  `${str}`.replace(/[^-.:@_*#/&\w\s]/g, "");
};

export const encryptToMD5 = (text: string) =>
  crypto.createHash("md5").update(text).digest("hex");

export const getUsernameFromEmail = (email?: string ) => !email ? "" :  email.split('@')?.[0]