/*
 * ========================================
 * MESSAGE CONSUMER SERVICE
 * ========================================
 * Consumes and processes messages from RabbitMQ
 */

const rabbitmqConfig = require('../config/rabbitmq');
const { QUEUES, CONSUMER_OPTIONS } = require('../config/queues');
const { getRedisClient } = require('../config/redis');
const { sendOTPEmail } = require('./emailService');

class MessageConsumer {
    constructor() {
        this.consumers = new Map();
        this.isRunning = false;
    }

    /**
     * Start all consumers
     */
    async start() {
        if (this.isRunning) {
            console.log('⚠️ Consumers already running');
            return;
        }

        try {
            console.log('🚀 Starting message consumers...');

            // Start expense consumers
            await this.consumeExpenseCreated();
            await this.consumeExpenseDeleted();

            // Start income consumers
            await this.consumeIncomeCreated();
            await this.consumeIncomeDeleted();

            // Start email consumer
            await this.consumeEmailNotification();

            // Start analytics consumers
            await this.consumeExpenseAnalytics();
            await this.consumeIncomeAnalytics();

            this.isRunning = true;
            console.log('✅ All message consumers started');

        } catch (error) {
            console.error('❌ Failed to start consumers:', error.message);
            throw error;
        }
    }

    /**
     * Generic consumer setup
     */
    async consume(queueName, handler, options = {}) {
        try {
            const channel = await rabbitmqConfig.getChannel();

            const consumerTag = await channel.consume(
                queueName,
                async (msg) => {
                    if (!msg) {
                        return;
                    }

                    try {
                        const content = JSON.parse(msg.content.toString());
                        console.log(`📥 Processing message from ${queueName}`);

                        // Process the message
                        await handler(content, msg);

                        // Acknowledge the message
                        channel.ack(msg);
                        console.log(`✅ Message acknowledged: ${queueName}`);

                    } catch (error) {
                        console.error(`❌ Error processing message from ${queueName}:`, error.message);

                        // Retry logic
                        const retryCount = msg.properties.headers?.['x-retry-count'] || 0;

                        if (retryCount < 3) {
                            console.log(`🔄 Requeuing message (retry ${retryCount + 1}/3)`);
                            channel.nack(msg, false, true);
                        } else {
                            console.log(`💀 Message rejected after 3 retries`);
                            channel.nack(msg, false, false);
                        }
                    }
                },
                { ...CONSUMER_OPTIONS, ...options }
            );

            this.consumers.set(queueName, consumerTag);
            console.log(`👂 Consumer listening on: ${queueName}`);

        } catch (error) {
            console.error(`❌ Failed to setup consumer for ${queueName}:`, error.message);
            throw error;
        }
    }

    /**
     * Expense Created Consumer
     */
    async consumeExpenseCreated() {
        await this.consume(QUEUES.EXPENSE_CREATED, async (message) => {
            const { data } = message;
            console.log('Processing expense created:', data);

            // Update Redis cache
            await this.updateExpenseCache(data);

            // Send notification (optional)
            console.log(`✅ Expense created notification processed for user ${data.userId}`);
        });
    }

    /**
     * Expense Deleted Consumer
     */
    async consumeExpenseDeleted() {
        await this.consume(QUEUES.EXPENSE_DELETED, async (message) => {
            const { data } = message;
            console.log('Processing expense deleted:', data);

            // Clear cache
            await this.clearExpenseCache(data);

            console.log(`✅ Expense deleted notification processed`);
        });
    }

    /**
     * Income Created Consumer
     */
    async consumeIncomeCreated() {
        await this.consume(QUEUES.INCOME_CREATED, async (message) => {
            const { data } = message;
            console.log('Processing income created:', data);

            // Update Redis cache
            await this.updateIncomeCache(data);

            console.log(`✅ Income created notification processed for user ${data.userId}`);
        });
    }

    /**
     * Income Deleted Consumer
     */
    async consumeIncomeDeleted() {
        await this.consume(QUEUES.INCOME_DELETED, async (message) => {
            const { data } = message;
            console.log('Processing income deleted:', data);

            // Clear cache
            await this.clearIncomeCache(data);

            console.log(`✅ Income deleted notification processed`);
        });
    }

    /**
     * Email Notification Consumer
     */
    async consumeEmailNotification() {
        await this.consume(QUEUES.EMAIL_NOTIFICATION, async (message) => {
            const { data } = message;
            console.log('Processing email notification:', data);

            // Send email using existing email service
            if (data.type === 'OTP') {
                await sendOTPEmail(data.email, data.otp, data.fullName);
            }

            console.log(`✅ Email notification sent`);
        });
    }

    /**
     * Expense Analytics Consumer
     */
    async consumeExpenseAnalytics() {
        await this.consume(QUEUES.EXPENSE_ANALYTICS, async (message) => {
            const { data, action } = message;
            console.log('Processing expense analytics:', action, data);

            // Update statistics in Redis
            await this.updateExpenseStatistics(data, action);
        });
    }

    /**
     * Income Analytics Consumer
     */
    async consumeIncomeAnalytics() {
        await this.consume(QUEUES.INCOME_ANALYTICS, async (message) => {
            const { data, action } = message;
            console.log('Processing income analytics:', action, data);

            // Update statistics in Redis
            await this.updateIncomeStatistics(data, action);
        });
    }

    /**
     * Helper: Update expense cache
     */
    async updateExpenseCache(expenseData) {
        try {
            const redisClient = getRedisClient();
            if (!redisClient) return;

            const cacheKey = `expense:${expenseData._id}`;
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(expenseData));
            console.log(`💾 Updated expense cache: ${cacheKey}`);
        } catch (error) {
            console.error('Failed to update expense cache:', error.message);
        }
    }

    /**
     * Helper: Clear expense cache
     */
    async clearExpenseCache(expenseData) {
        try {
            const redisClient = getRedisClient();
            if (!redisClient) return;

            const cacheKey = `expense:${expenseData._id}`;
            await redisClient.del(cacheKey);
            console.log(`🗑️ Cleared expense cache: ${cacheKey}`);
        } catch (error) {
            console.error('Failed to clear expense cache:', error.message);
        }
    }

    /**
     * Helper: Update income cache
     */
    async updateIncomeCache(incomeData) {
        try {
            const redisClient = getRedisClient();
            if (!redisClient) return;

            const cacheKey = `income:${incomeData._id}`;
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(incomeData));
            console.log(`💾 Updated income cache: ${cacheKey}`);
        } catch (error) {
            console.error('Failed to update income cache:', error.message);
        }
    }

    /**
     * Helper: Clear income cache
     */
    async clearIncomeCache(incomeData) {
        try {
            const redisClient = getRedisClient();
            if (!redisClient) return;

            const cacheKey = `income:${incomeData._id}`;
            await redisClient.del(cacheKey);
            console.log(`🗑️ Cleared income cache: ${cacheKey}`);
        } catch (error) {
            console.error('Failed to clear income cache:', error.message);
        }
    }

    /**
     * Helper: Update expense statistics
     */
    async updateExpenseStatistics(expenseData, action) {
        try {
            const redisClient = getRedisClient();
            if (!redisClient) return;

            const statsKey = `stats:expense:${expenseData.userId}`;
            const stats = await redisClient.get(statsKey);
            const currentStats = stats ? JSON.parse(stats) : { total: 0, count: 0 };

            if (action === 'CREATE') {
                currentStats.total += parseFloat(expenseData.amount || 0);
                currentStats.count += 1;
            } else if (action === 'DELETE') {
                currentStats.total -= parseFloat(expenseData.amount || 0);
                currentStats.count -= 1;
            }

            await redisClient.setEx(statsKey, 86400, JSON.stringify(currentStats));
            console.log(`📊 Updated expense statistics for user: ${expenseData.userId}`);
        } catch (error) {
            console.error('Failed to update expense statistics:', error.message);
        }
    }

    /**
     * Helper: Update income statistics
     */
    async updateIncomeStatistics(incomeData, action) {
        try {
            const redisClient = getRedisClient();
            if (!redisClient) return;

            const statsKey = `stats:income:${incomeData.userId}`;
            const stats = await redisClient.get(statsKey);
            const currentStats = stats ? JSON.parse(stats) : { total: 0, count: 0 };

            if (action === 'CREATE') {
                currentStats.total += parseFloat(incomeData.amount || 0);
                currentStats.count += 1;
            } else if (action === 'DELETE') {
                currentStats.total -= parseFloat(incomeData.amount || 0);
                currentStats.count -= 1;
            }

            await redisClient.setEx(statsKey, 86400, JSON.stringify(currentStats));
            console.log(`📊 Updated income statistics for user: ${incomeData.userId}`);
        } catch (error) {
            console.error('Failed to update income statistics:', error.message);
        }
    }

    /**
     * Stop all consumers
     */
    async stop() {
        try {
            const channel = await rabbitmqConfig.getChannel();

            for (const [queueName, consumerTag] of this.consumers.entries()) {
                await channel.cancel(consumerTag.consumerTag);
                console.log(`🛑 Stopped consumer: ${queueName}`);
            }

            this.consumers.clear();
            this.isRunning = false;
            console.log('✅ All consumers stopped');

        } catch (error) {
            console.error('❌ Failed to stop consumers:', error.message);
            throw error;
        }
    }
}

// Export singleton instance
module.exports = new MessageConsumer();