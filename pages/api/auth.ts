import crypto from "crypto";
import type {  NextApiRequest, NextApiResponse } from "next";
import { authorizationCode } from "./_lib/oauth2";

export const randomString = () => crypto.randomBytes(4).toString(`hex`);

export default (req: NextApiRequest, res: NextApiResponse) => {
  const { host } = req.headers;

  const url = authorizationCode().authorizeURL({
    redirect_uri: `https://${host}/api/callback`,
    scope: `repo,user`,
    state: randomString()
  });

  res.writeHead(301, { Location: url });
  res.end();
};
