import { CognitoUser, AuthenticationDetails, CognitoUserPool, CognitoUserAttribute, CognitoUserSession } from 'amazon-cognito-identity-js';
import { awsConfig } from '../config/aws-config';
import { userService } from './user.service';

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
    // Input validation
    if (!email || !password || !name) {
      throw new Error('Email, password, and name are required');
    }
    
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    const userPool = getUserPool();
    console.log('Signing up:', { email, name });
    
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
          console.error('Cognito SignUp Error:', err);
          // Handle specific Cognito error cases
          if (err.name === 'InvalidParameterException') {
            reject(new Error('Invalid email or password format'));
          } else if (err.name === 'UsernameExistsException') {
            reject(new Error('An account with this email already exists'));
          } else {
            reject(new Error('Registration failed: ' + err.message));
          }
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
        onSuccess: async (session) => {
          // Get user attributes after successful login
          const attributes = await this.getUserAttributes(cognitoUser);
          const name = attributes['name'];
          
          // Generate and store user hash
          const userHash = userService.generateUserId(name, email, password);
          localStorage.setItem('userHash', userHash);
          
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

  getUserHash(): string | null {
    return localStorage.getItem('userHash');
  },

  async signOut(): Promise<void> {
    const userPool = getUserPool();
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      localStorage.removeItem('userHash');
      cognitoUser.signOut();
    }
  },

  getCurrentSession: async () => {
    try {
      const session = await authService.getSession();
      return session?.isValid() || false;
    } catch (error) {
      return false;
    }
  }
};
