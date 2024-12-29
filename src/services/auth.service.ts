import { CognitoUser, AuthenticationDetails, CognitoUserPool, CognitoUserAttribute, CognitoUserSession } from 'amazon-cognito-identity-js';
import { awsConfig } from '../config/aws-config';

interface CognitoError extends Error {
  name: string;
  code?: string;
}

const getUserPool = (): CognitoUserPool => {
  if (!awsConfig.userPoolId || !awsConfig.userPoolWebClientId) {
    console.error('Cognito Configuration:', {
      region: awsConfig.region,
      userPoolId: awsConfig.userPoolId,
      clientId: awsConfig.userPoolWebClientId
    });
    throw new Error('AWS Cognito credentials are not configured');
  }
  
  try {
    return new CognitoUserPool({
      UserPoolId: awsConfig.userPoolId,
      ClientId: awsConfig.userPoolWebClientId
    });
  } catch (error) {
    console.error('Failed to initialize Cognito User Pool:', error);
    throw error;
  }
};

interface SignInResult {
  user: CognitoUser;
  session: CognitoUserSession;
}

export const authService = {
  async signUp(email: string, password: string, name: string) {
    const userPool = getUserPool();
    console.log('Signing up:', { email, name });
    console.log('User Pool:', userPool);
    return new Promise((resolve, reject) => {
      const attributeList = [
        new CognitoUserAttribute({
          Name: 'email',
          Value: email
        }),
        new CognitoUserAttribute({
          Name: 'name',
          Value: name
        })
      ];

      userPool.signUp(email, password, attributeList, [], (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  },

  async signIn(email: string, password: string): Promise<SignInResult> {
    const userPool = getUserPool();
    return new Promise((resolve, reject) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password
      });

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (session) => {
          resolve({ user: cognitoUser, session });
        },
        onFailure: (err: CognitoError) => {
          reject(err);
        }
      });
    });
  },

  async confirmSignUp(email: string, code: string): Promise<void> {
    const userPool = getUserPool();
    return new Promise((resolve, reject) => {
      if (!code || code.length < 6) {
        reject(new Error('Invalid verification code'));
        return;
      }

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      });

      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  },

  async getCurrentUser(): Promise<CognitoUser | null> {
    const userPool = getUserPool();
    return new Promise((resolve) => {
      const cognitoUser = userPool.getCurrentUser();
      if (!cognitoUser) {
        resolve(null);
        return;
      }
      resolve(cognitoUser);
    });
  },

  async getSession(): Promise<CognitoUserSession | null> {
    const userPool = getUserPool();
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) return null;

    return new Promise((resolve, reject) => {
      cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(session);
      });
    });
  },

  async getUserAttributes(user: CognitoUser): Promise<Record<string, string>> {
    return new Promise((resolve, reject) => {
      user.getUserAttributes((err, attributes) => {
        if (err) {
          reject(err);
          return;
        }
        const userAttributes: Record<string, string> = {};
        attributes?.forEach(attribute => {
          userAttributes[attribute.getName()] = attribute.getValue();
        });
        resolve(userAttributes);
      });
    });
  },

  async signOut(): Promise<void> {
    const userPool = getUserPool();
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
  }
};
