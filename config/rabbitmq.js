/*
 * ========================================
 * RABBITMQ CONFIGURATION
 * ========================================
 * Singleton connection manager with auto-reconnect
 */

const amqp = require('amqplib');

class RabbitMQConfig {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectDelay = 5000;
    }

    /**
     * Get RabbitMQ connection URL from environment
     */
    getConnectionURL() {
        const {
            RABBITMQ_USER = 'admin',
            RABBITMQ_PASS = 'admin123',
            RABBITMQ_HOST = 'localhost',
            RABBITMQ_PORT = '5672',
            RABBITMQ_VHOST = 'expense_tracker'
        } = process.env;

        return `amqp://${RABBITMQ_USER}:${RABBITMQ_PASS}@${RABBITMQ_HOST}:${RABBITMQ_PORT}/${RABBITMQ_VHOST}`;
    }

    /**
     * Connect to RabbitMQ
     */
    async connect() {
        // Return existing connection if available
        if (this.connection) {
            return this.connection;
        }

        // Prevent multiple simultaneous connection attempts
        if (this.isConnecting) {
            return new Promise((resolve, reject) => {
                const checkConnection = setInterval(() => {
                    if (this.connection) {
                        clearInterval(checkConnection);
                        resolve(this.connection);
                    } else if (!this.isConnecting) {
                        clearInterval(checkConnection);
                        reject(new Error('Connection failed'));
                    }
                }, 100);
            });
        }

        this.isConnecting = true;

        try {
            const url = this.getConnectionURL();
            console.log('🔌 Connecting to RabbitMQ...');

            this.connection = await amqp.connect(url, {
                heartbeat: 60,
                timeout: 10000
            });

            this.reconnectAttempts = 0;
            console.log('✅ RabbitMQ Connected Successfully');

            // Handle connection errors
            this.connection.on('error', (err) => {
                console.error('🔴 RabbitMQ connection error:', err.message);
                this.handleConnectionClose();
            });

            // Handle connection close
            this.connection.on('close', () => {
                console.warn('⚠️ RabbitMQ connection closed');
                this.handleConnectionClose();
            });

            return this.connection;

        } catch (error) {
            console.error('❌ Failed to connect to RabbitMQ:', error.message);
            this.isConnecting = false;
            await this.handleReconnect();
            throw error;
        } finally {
            this.isConnecting = false;
        }
    }

    /**
     * Get or create channel
     */
    async getChannel() {
        if (this.channel) {
            return this.channel;
        }

        try {
            const connection = await this.connect();
            this.channel = await connection.createChannel();

            // Set prefetch for fair dispatch
            await this.channel.prefetch(1);

            console.log('✅ RabbitMQ channel created');

            // Handle channel errors
            this.channel.on('error', (err) => {
                console.error('🔴 RabbitMQ channel error:', err.message);
                this.channel = null;
            });

            // Handle channel close
            this.channel.on('close', () => {
                console.warn('⚠️ RabbitMQ channel closed');
                this.channel = null;
            });

            return this.channel;

        } catch (error) {
            console.error('❌ Failed to create RabbitMQ channel:', error.message);
            throw error;
        }
    }

    /**
     * Handle connection close
     */
    handleConnectionClose() {
        this.connection = null;
        this.channel = null;
        this.isConnecting = false;
    }

    /**
     * Handle reconnection with exponential backoff
     */
    async handleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('❌ Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

        console.log(`🔄 Reconnecting to RabbitMQ (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);

        await new Promise(resolve => setTimeout(resolve, delay));

        try {
            await this.connect();
        } catch (error) {
            console.error('❌ Reconnection failed:', error.message);
        }
    }

    /**
     * Check if connected
     */
    isConnected() {
        return this.connection !== null && this.channel !== null;
    }

    /**
     * Close connection gracefully
     */
    async close() {
        try {
            if (this.channel) {
                await this.channel.close();
                this.channel = null;
            }
            if (this.connection) {
                await this.connection.close();
                this.connection = null;
            }
            console.log('✅ RabbitMQ connection closed gracefully');
        } catch (error) {
            console.error('❌ Error closing RabbitMQ connection:', error.message);
        }
    }
}

// Export singleton instance
module.exports = new RabbitMQConfig();