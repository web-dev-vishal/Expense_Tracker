/*
 * ========================================
 * QUEUE & EXCHANGE DEFINITIONS
 * ========================================
 */

const EXCHANGES = {
    EXPENSE: 'expense_exchange',
    INCOME: 'income_exchange',
    EMAIL: 'email_exchange',
    ANALYTICS: 'analytics_exchange'
};

const QUEUES = {
    // Expense queues
    EXPENSE_CREATED: 'expense.created',
    EXPENSE_DELETED: 'expense.deleted',
    
    // Income queues
    INCOME_CREATED: 'income.created',
    INCOME_DELETED: 'income.deleted',
    
    // Email queue
    EMAIL_NOTIFICATION: 'email.notification',
    
    // Analytics queues
    EXPENSE_ANALYTICS: 'expense.analytics',
    INCOME_ANALYTICS: 'income.analytics'
};

const ROUTING_KEYS = {
    // Expense routing keys
    EXPENSE_CREATED: 'expense.created',
    EXPENSE_DELETED: 'expense.deleted',
    
    // Income routing keys
    INCOME_CREATED: 'income.created',
    INCOME_DELETED: 'income.deleted',
    
    // Email routing key
    EMAIL_NOTIFICATION: 'email.notification',
    
    // Analytics routing keys
    ANALYTICS_EXPENSE: 'analytics.expense',
    ANALYTICS_INCOME: 'analytics.income'
};

/**
 * Exchange configuration
 */
const EXCHANGE_OPTIONS = {
    durable: true,
    autoDelete: false
};

/**
 * Queue configuration with persistence
 */
const QUEUE_OPTIONS = {
    durable: true,
    autoDelete: false,
    messageTtl: 86400000, // 24 hours
    maxLength: 10000
};

/**
 * Message publish options
 */
const PUBLISH_OPTIONS = {
    persistent: true,
    contentType: 'application/json',
    contentEncoding: 'utf-8'
};

/**
 * Consumer options
 */
const CONSUMER_OPTIONS = {
    noAck: false // Manual acknowledgment
};

module.exports = {
    EXCHANGES,
    QUEUES,
    ROUTING_KEYS,
    EXCHANGE_OPTIONS,
    QUEUE_OPTIONS,
    PUBLISH_OPTIONS,
    CONSUMER_OPTIONS
};