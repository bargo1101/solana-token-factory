// apiClient.js

const axios = require('axios');

class ApiClient {
    constructor(baseURL) {
        this.client = axios.create({
            baseURL,
        });
    }

    async getWalletInfo(walletAddress) {
        try {
            const response = await this.client.get(`/wallets/${walletAddress}`);
            return response.data;
        } catch (error) {
            throw new Error('Error fetching wallet info: ' + error.message);
        }
    }

    async getNetworkStatus() {
        try {
            const response = await this.client.get('/network/status');
            return response.data;
        } catch (error) {
            throw new Error('Error fetching network status: ' + error.message);
        }
    }

    async getTokenInfo(tokenAddress) {
        try {
            const response = await this.client.get(`/tokens/${tokenAddress}`);
            return response.data;
        } catch (error) {
            throw new Error('Error fetching token info: ' + error.message);
        }
    }
}

module.exports = ApiClient;