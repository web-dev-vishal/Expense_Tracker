/*
 * ========================================
 * MESSAGE PUBLISHER SERVICE
 * ========================================
 * Publishes messages to RabbitMQ exchanges
 */

const rabbitmqConfig = require('../config/rabbitmq');
const {
    EXCHANGES,
    QUEUES,
    ROUTING_KEYS,
    EXCHANGE_OPTIONS,
    QUEUE_OPTIONS,
    PUBLISH_OPTIONS
} = require('../config/queues');

class MessagePublisher {
    constructor() {
        this.isInitialized = false;
    }

    /**
     * Initialize exchanges and queues
     */
    async initialize() {
        if (this.isInitialized) {
            return;
        }

        try {
            const channel = await rabbitmqConfig.getChannel();

            // Create exchanges
            await channel.assertExchange(EXCHANGES.EXPENSE, 'topic', EXCHANGE_OPTIONS);
            await channel.assertExchange(EXCHANGES.INCOME, 'topic', EXCHANGE_OPTIONS);
            await channel.assertExchange(EXCHANGES.EMAIL, 'topic', EXCHANGE_OPTIONS);
            await channel.assertExchange(EXCHANGES.ANALYTICS, 'topic', EXCHANGE_OPTIONS);

            console.log('✅ RabbitMQ exchanges created');

            // Create and bind queues
            await this.setupQueues(channel);

            this.isInitialized = true;
            console.log('✅ Message Publisher initialized');

        } catch (error) {
            console.error('❌ Failed to initialize Message Publisher:', error.message);
            throw error;
        }
    }

    /**
     * Setup all queues and bindings
     */
    async setupQueues(channel) {
        // Expense queues
        await this.bindQueue(channel, QUEUES.EXPENSE_CREATED, EXCHANGES.EXPENSE, ROUTING_KEYS.EXPENSE_CREATED);
        await this.bindQueue(channel, QUEUES.EXPENSE_DELETED, EXCHANGES.EXPENSE, ROUTING_KEYS.EXPENSE_DELETED);
        await this.bindQueue(channel, QUEUES.EXPENSE_ANALYTICS, EXCHANGES.ANALYTICS, ROUTING_KEYS.ANALYTICS_EXPENSE);

        // Income queues
        await this.bindQueue(channel, QUEUES.INCOME_CREATED, EXCHANGES.INCOME, ROUTING_KEYS.INCOME_CREATED);
        await this.bindQueue(channel, QUEUES.INCOME_DELETED, EXCHANGES.INCOME, ROUTING_KEYS.INCOME_DELETED);
        await this.bindQueue(channel, QUEUES.INCOME_ANALYTICS, EXCHANGES.ANALYTICS, ROUTING_KEYS.ANALYTICS_INCOME);

        // Email queue
        await this.bindQueue(channel, QUEUES.EMAIL_NOTIFICATION, EXCHANGES.EMAIL, ROUTING_KEYS.EMAIL_NOTIFICATION);

        console.log('✅ All queues created and bound');
    }

    /**
     * Bind queue to exchange
     */
    async bindQueue(channel, queueName, exchangeName, routingKey) {
        await channel.assertQueue(queueName, QUEUE_OPTIONS);
        await channel.bindQueue(queueName, exchangeName, routingKey);
        console.log(`🔗 Queue bound: ${queueName} -> ${exchangeName} (${routingKey})`);
    }

    /**
     * Generic publish method
     */
    async publish(exchange, routingKey, message, options = {}) {
        try {
            await this.initialize();
            const channel = await rabbitmqConfig.getChannel();

            const messageBuffer = Buffer.from(JSON.stringify(message));
            const publishOpts = {
                ...PUBLISH_OPTIONS,
                ...options,
                timestamp: Date.now(),
                messageId: this.generateMessageId()
            };

            const published = channel.publish(
                exchange,
                routingKey,
                messageBuffer,
                publishOpts
            );

            if (published) {
                console.log(`📤 Message published: ${exchange} -> ${routingKey}`);
                return true;
            } else {
                console.warn(`⚠️ Message not published (buffer full): ${exchange} -> ${routingKey}`);
                return false;
            }

        } catch (error) {
            console.error(`❌ Failed to publish message: ${error.message}`);
            // Don't throw error - allow operation to continue
            return false;
        }
    }

    /**
     * Publish expense created event
     */
    async publishExpenseCreated(expenseData) {
        const message = {
            event: 'EXPENSE_CREATED',
            timestamp: new Date().toISOString(),
            data: expenseData
        };

        await this.publish(EXCHANGES.EXPENSE, ROUTING_KEYS.EXPENSE_CREATED, message);

        // Also publish to analytics
        await this.publish(EXCHANGES.ANALYTICS, ROUTING_KEYS.ANALYTICS_EXPENSE, {
            event: 'ANALYTICS_UPDATE',
            action: 'CREATE',
            data: expenseData
        });
    }

    /**
     * Publish expense deleted event
     */
    async publishExpenseDeleted(expenseData) {
        const message = {
            event: 'EXPENSE_DELETED',
            timestamp: new Date().toISOString(),
            data: expenseData
        };

        await this.publish(EXCHANGES.EXPENSE, ROUTING_KEYS.EXPENSE_DELETED, message);

        // Also publish to analytics
        await this.publish(EXCHANGES.ANALYTICS, ROUTING_KEYS.ANALYTICS_EXPENSE, {
            event: 'ANALYTICS_UPDATE',
            action: 'DELETE',
            data: expenseData
        });
    }

    /**
     * Publish income created event
     */
    async publishIncomeCreated(incomeData) {
        const message = {
            event: 'INCOME_CREATED',
            timestamp: new Date().toISOString(),
            data: incomeData
        };

        await this.publish(EXCHANGES.INCOME, ROUTING_KEYS.INCOME_CREATED, message);

        // Also publish to analytics
        await this.publish(EXCHANGES.ANALYTICS, ROUTING_KEYS.ANALYTICS_INCOME, {
            event: 'ANALYTICS_UPDATE',
            action: 'CREATE',
            data: incomeData
        });
    }

    /**
     * Publish income deleted event
     */
    async publishIncomeDeleted(incomeData) {
        const message = {
            event: 'INCOME_DELETED',
            timestamp: new Date().toISOString(),
            data: incomeData
        };

        await this.publish(EXCHANGES.INCOME, ROUTING_KEYS.INCOME_DELETED, message);

        // Also publish to analytics
        await this.publish(EXCHANGES.ANALYTICS, ROUTING_KEYS.ANALYTICS_INCOME, {
            event: 'ANALYTICS_UPDATE',
            action: 'DELETE',
            data: incomeData
        });
    }

    /**
     * Publish email notification
     */
    async publishEmailNotification(emailData) {
        const message = {
            event: 'EMAIL_NOTIFICATION',
            timestamp: new Date().toISOString(),
            data: emailData
        };

        await this.publish(EXCHANGES.EMAIL, ROUTING_KEYS.EMAIL_NOTIFICATION, message);
    }

    /**
     * Generate unique message ID
     */
    generateMessageId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Export singleton instance
module.exports = new MessagePublisher();