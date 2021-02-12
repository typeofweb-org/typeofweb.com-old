import { ClientCredentials, AuthorizationCode } from "simple-oauth2";

const CONFIG = {
  client: {
    id: process.env.OAUTH_CLIENT_ID!,
    secret: process.env.OAUTH_CLIENT_SECRET!,
  },
  auth: {
    tokenHost: `https://github.com`,
    tokenPath: `/login/oauth/access_token`,
    authorizePath: `/login/oauth/authorize`
  }
}

export const authorizationCode = () => new AuthorizationCode(CONFIG);
export const clientCredentials = () => new ClientCredentials(CONFIG);
  
type Content = {
  type: 'success';
  token: string; provider: "github"
} | {type: 'error', error: object}

export const renderBody = ({type, ...content}: Content) => `
<script>
  const receiveMessage = (message) => {
    window.opener.postMessage(
      'authorization:github:${type}:${JSON.stringify(content)}',
      message.origin
    );
    window.removeEventListener("message", receiveMessage, false);
  }
  window.addEventListener("message", receiveMessage, false);
  
  window.opener.postMessage("authorizing:github", "*");
</script>
`;
