module.exports = {
  apps: [
    {
      name: "tratoagro-itr",
      script: "server.js",
      instances: "max",       // cluster mode – one process per CPU core
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "512M",

      env: {
        NODE_ENV: "development",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },

      // Logging
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      merge_logs: true,

      // Auto-restart on crash
      autorestart: true,
      restart_delay: 3000,
      max_restarts: 10,
    },
  ],
};
