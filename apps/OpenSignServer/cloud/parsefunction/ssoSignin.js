import axios from 'axios';
import { cloudServerUrl } from '../../Utils.js';
import { jwtDecode } from "jwt-decode";

const serverUrl = cloudServerUrl; //process.env.SERVER_URL;
const APPID = process.env.APP_ID;
const masterKEY = process.env.MASTER_KEY;
const clientUrl = process.env.PUBLIC_URL;
const ssoApiUrl = process.env.SSO_API_URL || 'https://sso.opensignlabs.com/api'; //'https://osl-jacksonv2.vercel.app/api';
/**
 * ssoSign is function which is used to sign up/sign in with SSO
 * @param code It is code return by jackson using authorize endpoint
 * @param email It is user's email with user sign in/sign up
 * @returns if success {email, name, phone message, sessiontoken} else on reject error {code, message}
 */

export default async function ssoSignin(request) {
  const code = request.params.code;
  const code_verifier = request.params.code_verifier;
  let userEmail = request.params.email;
  try {
    const headers = { 'content-type': 'application/x-www-form-urlencoded' };
    const axiosRes = await axios.post(
      ssoApiUrl + '/oauth2/token',
      {
        grant_type: 'authorization_code',
        client_id: '6bc25e50-e235-4c27-83cb-83fa0e63368a',
        client_secret: 'fqWzysk3SZ6b45bwFy1rJ2DKVwv5nppNmSQ',
        redirect_uri: 'http://localhost:3000/opensign/sso',
        code: code,
        code_verifier: code_verifier,
      },
      { headers: headers }
    );
    const ssoAccessToken = axiosRes.data && axiosRes.data.access_token;
    //从 id_token 中获取用户信息
    const decodedToken = jwtDecode(axiosRes.data.id_token);
    userEmail = decodedToken.email
    const authData = { sso: { id: userEmail, access_token: ssoAccessToken } };
    const userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo('username', userEmail);
    const res = await userQuery.first({ useMasterKey: true });
    if (res) {
      try {
        console.log(serverUrl + '/users/' + res.id)
        const SignIn = await axios.put(
          serverUrl + "/users/JXVr6vaOTs",
          { authData: authData },
          {
            headers: {
              'X-Parse-Application-Id': APPID,
              'X-Parse-Master-key': masterKEY,
              'Content-Type': 'application/json',
            },
          }
        );

        if (SignIn.data) {
          const response = await axios.get(ssoApiUrl + '/userinfo', {
            headers: {
              Authorization: `Bearer ${ssoAccessToken}`,
            },
          });
          const sessiontoken = SignIn.data.sessionToken;
          //   console.log('sso sessiontoken', sessiontoken);
          const payload = {
            email: userEmail,
            name: response.data?.preferred_username ,
            phone: response?.data?.phone || '',
            message: 'User Sign In',
            sessiontoken: sessiontoken,
            access_token: axiosRes.data.access_token,
            id_token: axiosRes.data.id_token,
          };
          return payload;
        }
      } catch (err) {
        const errCode = err?.response?.data?.code || err?.response?.status || err?.code || 400;
        const message =
          err?.response?.data?.error ||
          err?.response?.data ||
          err?.message ||
          'Internal server error.';
        console.log('err in user sso sign in', errCode, message);
        throw new Parse.Error(errCode, message);
      }
    } else {
      // console.log("in sign up condition");
      const response = await axios.get(ssoApiUrl + '/oauth2/userinfo', {
        headers: {
          Authorization: `Bearer ${ssoAccessToken}`,
        },
      });
      console.log('response.data', response.data)
      if (response.data && response.data.sub) {
        try {
          const SignUp = await axios.post(
            serverUrl + '/users',
            {
              authData: authData,
              username: response.data.email,
              email: response.data.email,
              phone: response.data?.phone,
              name: response.data?.firstName + ' ' + response.data?.lastName,
            },
            {
              headers: {
                'X-Parse-Application-Id': APPID,
                'X-Parse-Revocable-Session': '1',
              },
            }
          );
          if (SignUp.data) {
            const sessiontoken = SignUp.data.sessionToken;
            const payload = {
              email: userEmail,
              name: SignUp?.data?.name,
              phone: SignUp?.data?.phone || '',
              message: 'User Sign Up',
              sessiontoken: sessiontoken,
              access_token: axiosRes.data.access_token,
              id_token: axiosRes.data.id_token,
            };
            return payload;
          }
        } catch (err) {
          const errCode = err?.response?.data?.code || err?.response?.status || err?.code || 400;
          const message =
            err?.response?.data?.error ||
            err?.response?.data ||
            err?.message ||
            'Internal server error.';
          console.log('err in user sso sign up', errCode, message);
          throw new Parse.Error(errCode, message);
        }
      }
    }
  } catch (err) {
    const errCode = err?.response?.status || err?.code || 400;
    const message = err?.response?.data || err?.message || 'Internal server error.';
    console.log('err in ssoSign', errCode, message);
    throw new Parse.Error(errCode, message);
  }
}
