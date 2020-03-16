
ENVIRONMENT=$1
PROJECT_NAME="ec-posthire-upload-worker"

if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" && [ "$ENVIRONMENT" != "demo" ]; then
  echo "ERROR: You need to pass as parameter the name of the environment (demo or production) to run this script.";
  exit 1;
fi

echo "The project" $PROJECT_NAME "is going to be deployed in the" $ENVIRONMENT "environmet.";

echo "Cleaning previous changes..."
git checkout .

if [ "$ENVIRONMENT" = "staging" ]; then
  git checkout test
  NODE_ENVIRONMENT='staging'
fi

if [ "$ENVIRONMENT" = "production" ]; then
  git checkout master
fi

if [ "$ENVIRONMENT" = "demo" ]; then
  git checkout demo
fi

echo "Fetching updates..."
git pull

cd ../../
echo "Installing dependencies..."
npm install

echo "Killing the pm2 instance..."
pm2 delete "$PROJECT_NAME"

cd src/workers
"Starting the pm2 instance..."
pm2 restart ecosystem.config.js --env $ENVIRONMENT --update-env

echo "$PROJECT_NAME deployed successfully"
