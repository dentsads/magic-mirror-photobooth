module.exports = {
    apps : [
        {
            name: "magic-mirror-server",
            script: "npm run start:server",
            env: {
                "NODE_ENV": "production"
            }
        },
        {
            name: "magic-mirror-client",
            script: "npm run start:client -- --host 0.0.0.0 --configuration=production"
        }
    ]
}