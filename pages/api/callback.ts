import type { NextApiRequest, NextApiResponse } from "next";
import { clientCredentials, authorizationCode, renderBody } from "./_lib/oauth2";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const code = req.query.code as string;
  const { host } = req.headers;

  try {
    const accessToken = await authorizationCode().getToken({
      code,
      redirect_uri: `https://${host}/api/callback`
    });
    const { token } = clientCredentials().createToken(accessToken);

    res.status(200).send(
      renderBody({
        type: "success",
        token: token.access_token,
        provider: "github"
      })
    );
  } catch (e) {
    res.status(200).send(renderBody({type: "error", error: e}));
  }
};
