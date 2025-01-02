export const awsConfig = {
    region: process.env.NEXT_PUBLIC_AWS_REGION || 'eu-central-1',
    userPoolId: process.env.NEXT_PUBLIC_AWS_USER_POOL_ID,
    userPoolWebClientId: process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID,
};

// Validate configuration
if (!awsConfig.userPoolId || !awsConfig.userPoolWebClientId) {
    console.error('AWS Cognito configuration is missing required values:', awsConfig);
}
