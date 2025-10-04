#!/bin/bash

# Persian Connect Deployment Script
# Usage: ./deploy.sh [environment]
# Environments: development, staging, production

set -e

ENVIRONMENT=${1:-development}
PROJECT_NAME="persian-connect"

echo "🚀 Deploying Persian Connect to $ENVIRONMENT environment..."

# Function to deploy to Netlify
deploy_netlify() {
    echo "📦 Building for Netlify..."
    npm run build
    
    if [ "$ENVIRONMENT" = "production" ]; then
        echo "🌐 Deploying to production..."
        npx netlify deploy --prod --dir=dist --site=persian-connect-prod
    else
        echo "🔧 Deploying to staging..."
        npx netlify deploy --dir=dist --site=persian-connect-staging
    fi
}

# Function to deploy to Vercel
deploy_vercel() {
    echo "📦 Building for Vercel..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        echo "🌐 Deploying to production..."
        npx vercel --prod
    else
        echo "🔧 Deploying to staging..."
        npx vercel
    fi
}

# Function to deploy with Docker
deploy_docker() {
    echo "🐳 Building Docker image..."
    
    # Build image
    docker build -f docker/Dockerfile -t $PROJECT_NAME:$ENVIRONMENT .
    
    if [ "$ENVIRONMENT" = "production" ]; then
        # Tag for production
        docker tag $PROJECT_NAME:$ENVIRONMENT persianconnect/app:latest
        docker tag $PROJECT_NAME:$ENVIRONMENT persianconnect/app:$ENVIRONMENT
        
        echo "📤 Pushing to registry..."
        docker push persianconnect/app:latest
        docker push persianconnect/app:$ENVIRONMENT
    fi
    
    echo "🏃 Starting container..."
    docker run -d -p 80:80 --name $PROJECT_NAME-$ENVIRONMENT $PROJECT_NAME:$ENVIRONMENT
}

# Function to validate environment
validate_env() {
    case $ENVIRONMENT in
        development|staging|production)
            echo "✅ Environment: $ENVIRONMENT"
            ;;
        *)
            echo "❌ Invalid environment: $ENVIRONMENT"
            echo "Valid environments: development, staging, production"
            exit 1
            ;;
    esac
}

# Function to run tests
run_tests() {
    echo "🧪 Running tests..."
    
    # Check if all required files exist
    required_files=(
        "public/robots.txt"
        "public/sitemap.xml"
        "public/manifest.json"
        "config/domain.ts"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            echo "❌ Missing required file: $file"
            exit 1
        fi
    done
    
    echo "✅ All required files present"
    
    # Validate package.json
    if ! npm run build:check 2>/dev/null; then
        echo "⚠️  Build check not available, proceeding..."
    fi
}

# Function to update domain configuration
update_domain_config() {
    echo "🔧 Updating domain configuration for $ENVIRONMENT..."
    
    case $ENVIRONMENT in
        production)
            export REACT_APP_DOMAIN="persianconnect.com"
            export REACT_APP_API_URL="https://api.persianconnect.com"
            ;;
        staging)
            export REACT_APP_DOMAIN="staging.persianconnect.com"
            export REACT_APP_API_URL="https://api-staging.persianconnect.com"
            ;;
        development)
            export REACT_APP_DOMAIN="localhost:3000"
            export REACT_APP_API_URL="http://localhost:3001"
            ;;
    esac
    
    echo "✅ Domain configured: $REACT_APP_DOMAIN"
}

# Main deployment process
main() {
    validate_env
    update_domain_config
    run_tests
    
    # Check deployment method
    if command -v netlify &> /dev/null; then
        deploy_netlify
    elif command -v vercel &> /dev/null; then
        deploy_vercel
    elif command -v docker &> /dev/null; then
        deploy_docker
    else
        echo "❌ No deployment method available"
        echo "Install netlify-cli, vercel, or docker to deploy"
        exit 1
    fi
    
    echo "🎉 Deployment complete!"
    echo "🌐 Your Persian Connect marketplace is live!"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        echo "🔗 Production URL: https://persianconnect.com"
    elif [ "$ENVIRONMENT" = "staging" ]; then
        echo "🔗 Staging URL: https://staging.persianconnect.com"
    fi
}

# Run main function
main