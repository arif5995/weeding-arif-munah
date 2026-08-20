import app from "../src/server/index.js";

export default {
    async fetch(request) {
        return app.fetch(request);
    },
};