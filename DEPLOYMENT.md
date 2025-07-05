# AWS Amplify Deployment Guide

## Project Structure

The project has been restructured for AWS Amplify deployment:

```
Centipede/
├── index.html          # Main HTML file (moved from src/)
├── amplify.yml         # Amplify build configuration
├── js/                 # JavaScript modules (moved from src/js/)
│   ├── config.js       # API configuration
│   ├── main.js
│   ├── login.js
│   ├── battle.js
│   ├── menu.js
│   ├── state.js
│   ├── recruitment.js
│   └── ...
├── css/                # Stylesheets (moved from src/css/)
├── assets/             # Static assets (images, etc.)
├── lambda/             # AWS Lambda functions
└── src/                # Original source (can be removed after deployment)
```

## Configuration

### API Endpoints

All API endpoints are now centralized in `js/config.js`. Update the `API_CONFIG` object with your actual API Gateway endpoints:

```javascript
export const API_CONFIG = {
    BASE_URL: 'https://your-api-gateway-id.execute-api.region.amazonaws.com',
    ENDPOINTS: {
        LOGIN: '/login',
        REGISTER: '/register',
        LOAD_ACCOUNT: '/loadaccount',
        LOAD_ALLIES: '/loadallies',
        LOAD_ENEMIES: '/loadenemies',
        LOAD_RECRUITMENTS: '/loadrecruitments',
        LOAD_PARTY: '/loadparty',
        ADD_PARTY: '/addparty',
        STORE_BATTLE: '/storebattle',
        PULL_RECRUITMENT: '/pullrecruitment'
    }
};
```

## Deployment Steps

### 1. AWS Amplify Setup

1. Log in to the AWS Amplify Console
2. Click "New app" → "Host web app"
3. Connect your Git repository (GitHub, GitLab, etc.)
4. Select the branch you want to deploy

### 2. Build Configuration

Amplify will automatically detect the `amplify.yml` file. The build configuration includes:

- **Pre-build**: Basic setup commands
- **Build**: Copy files to build directory
- **Artifacts**: Serve all files from root directory

### 3. Environment Variables (Optional)

If you need different API endpoints for different environments:

1. Go to App Settings → Environment variables
2. Add variables like:
   - `API_BASE_URL`: Your API Gateway base URL
   - `ENVIRONMENT`: `development`, `staging`, or `production`

### 4. Custom Domain (Optional)

1. Go to App Settings → Domain management
2. Add your custom domain
3. Configure DNS settings as instructed

## Lambda Functions

The `lambda/` directory contains your backend functions. Deploy these separately:

1. **Using AWS CLI**:
   ```bash
   cd lambda/function-name
   zip -r function.zip .
   aws lambda update-function-code --function-name your-function-name --zip-file fileb://function.zip
   ```

2. **Using AWS SAM**:
   ```bash
   sam build
   sam deploy --guided
   ```

3. **Using Serverless Framework**:
   ```bash
   serverless deploy
   ```

## Testing

After deployment:

1. Visit your Amplify app URL
2. Test user registration and login
3. Verify API calls are working
4. Test battle system functionality
5. Check image loading from assets

## Troubleshooting

### Common Issues

1. **API CORS Errors**: Ensure your API Gateway has CORS configured for your Amplify domain
2. **Image Loading Issues**: Verify asset paths are correct (should be `assets/images/...`)
3. **Module Loading Errors**: Check that all import statements use relative paths

### Monitoring

- Use AWS CloudWatch for Lambda function logs
- Use Amplify Console for deployment logs
- Use browser developer tools for frontend debugging

## Performance Optimization

1. **Enable Gzip compression** in Amplify settings
2. **Set up CloudFront caching** for static assets
3. **Optimize images** in the assets directory
4. **Minify JavaScript** (add to build process if needed)

## Security Considerations

1. **API Authentication**: Ensure all API endpoints require proper authentication
2. **Input Validation**: Validate all user inputs on both frontend and backend
3. **HTTPS**: Amplify automatically provides HTTPS
4. **Environment Variables**: Store sensitive data in environment variables, not in code

## Maintenance

1. **Regular Updates**: Keep dependencies updated
2. **Monitoring**: Set up CloudWatch alarms for API errors
3. **Backup**: Regularly backup your DynamoDB data
4. **Testing**: Implement automated testing for critical paths 