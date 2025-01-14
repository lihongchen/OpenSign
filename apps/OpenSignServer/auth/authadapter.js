import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const ssoApiUrl = process.env.SSO_API_URL || 'https://sso.opensignlabs.com/api'; //'https://osl-jacksonv2.vercel.app/api';
export const SSOAuth = {
  // Returns a promise that fulfills if this user mail is valid.
  validateAuthData: async authData => {
    try {
      const response = await axios.get(ssoApiUrl + '/userinfo', {
        headers: {
          Authorization: `Bearer ${authData.access_token}`,
        },
      });
      console.log('response.data', response.data);
      if (response.data && response.data.sub && response.data.email === authData.id) {
        return;
      }
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'SSO auth is invalid for this user.');
    } catch (error) {
      console.log('error in sso adapter', error?.response);
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'SSO auth is invalid for this user.');
    }
  },

  // Returns a promise that fulfills if this app id is valid.
  validateAppId: () => {
    return Promise.resolve();
  },
};
