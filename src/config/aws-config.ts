export const awsConfig = {
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  userPoolId: process.env.NEXT_PUBLIC_AWS_USER_POOL_ID,
  userPoolWebClientId: process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID,
  authenticationFlowType: 'USER_PASSWORD_AUTH'
} as const;

if (typeof window !== 'undefined') { 
  if (!awsConfig.userPoolId || !awsConfig.userPoolWebClientId) {
    console.error('AWS Cognito credentials are missing. Please check your environment variables.');
  }
}
