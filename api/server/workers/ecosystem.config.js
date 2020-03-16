module.exports = {
  apps: [
    {
      name: 'ec-posthire-upload-worker',
      script: './index.js',
      exec_mode: 'cluster',
      instances: 0,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      env_staging: {
        NODE_ENV: 'staging'
      },
      env_demo: {
        NODE_ENV: 'demo'
      }
    }
  ]
};
