import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

const oidcClient = new UserManager({
  authority: process.env.SSO_API_URL || 'http://192.168.2.70:9080/hydra-public', // Hydra 的 public URL
  client_id: process.env.SSO_CLIENT_ID || '6bc25e50-e235-4c27-83cb-83fa0e63368a', // 在 Hydra 中注册的客户端 ID
  redirect_uri: process.env.SSO_REDIRECT_URI || 'http://localhost:3000/opensign/sso', // 登录成功后的回调地址
  post_logout_redirect_uri: process.env.SSO_POST_LOGOUT_REDIRECT_URI || 'http://localhost:3000/opensign',
  response_type: 'code', // 使用授权码模式
  scope: 'openid profile email offline_access', // OIDC 的默认 scope
  stateStore: new WebStorageStateStore({ store: window.localStorage }), // 使用 localStorage 管理状态
});

export default oidcClient;
