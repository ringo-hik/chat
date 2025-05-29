const https = require('https');
const http = require('http');
const logger = require('./logger');

class ApiService {
    constructor() {
        // 올바른 포트 설정
        this.baseURL = 'http://localhost:443';  // Mock 서버 포트
        this.timeout = 30000;
        logger.log('ApiService initialized with baseURL:', this.baseURL);
    }

    async httpRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const parsedUrl = new URL(url);
            const isHttps = parsedUrl.protocol === 'https:';
            const client = isHttps ? https : http;
            
            const requestOptions = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || (isHttps ? 443 : 80),
                path: parsedUrl.pathname + parsedUrl.search,
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'SWDP-ChatOps-Extension/1.0.0',
                    ...options.headers
                },
                timeout: this.timeout
            };

            // 요청 시작 로깅
            logger.log('Starting HTTP request to:', url);
            logger.log('Request options:', JSON.stringify(requestOptions, null, 2));
            
            const req = client.request(requestOptions, (res) => {
                logger.log(`Response received - Status: ${res.statusCode}`);
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                    logger.log('Data chunk received, length:', chunk.length);
                });
                res.on('end', () => {
                    try {
                        logger.log(`Raw response data: ${data}`);
                        const result = {
                            status: res.statusCode,
                            statusText: res.statusMessage,
                            data: data ? JSON.parse(data) : null
                        };
                        logger.log(`Parsed response:`, result);
                        resolve(result);
                    } catch (parseError) {
                        logger.error(`JSON parse error:`, parseError);
                        resolve({
                            status: res.statusCode,
                            statusText: res.statusMessage,
                            data: data,
                            parseError: parseError.message
                        });
                    }
                });
            });

            req.on('error', (error) => {
                logger.error('HTTP request error:', error);
                reject(error);
            });
            
            req.on('timeout', () => {
                logger.error('HTTP request timeout after', this.timeout, 'ms');
                req.destroy();
                reject(new Error('Request timeout'));
            });
            
            req.on('connect', () => {
                logger.log('HTTP connection established');
            });

            if (options.data) {
                const requestBody = JSON.stringify(options.data);
                logger.log('Request body:', requestBody);
                req.write(requestBody);
            }

            logger.log('Sending HTTP request...');
            req.end();
        });
    }


    /**
     * Process Weekly Report Request (Generate or Apply Feedback)
     * @param {string} userId - User ID extracted from git email
     * @param {string} [feedback] - User feedback text (optional)
     * @param {string} [currentReport] - Current report content to be modified (optional)
     * @returns {Promise<Object>} API response
     */
    async processWeeklyReport(userId, feedback = null, currentReport = null) {
        try {
            let userQuery;
            
            if (feedback && currentReport) {
                userQuery = `<<DOCUMENT_START>>\n${currentReport}\n<<DOCUMENT_END>>\n\nREVISION_REQUEST: ${feedback}\n\nPlease revise the above document based on the revision request.`;
            } else {
                userQuery = "Generate a comprehensive weekly report based on the data from the last 8 days starting from today.";
            }
            
            const requestData = {
                userId: userId,
                userQuery: userQuery
            };
            
            logger.log('API Request URL:', `${this.baseURL}/message-async/devportal/api/v1/extension/message-async`);
            logger.log('API Request Data:', requestData);
            
            const response = await this.httpRequest(`${this.baseURL}/devportal/api/v1/extension/message-async`, {
                method: 'POST',
                data: requestData
            });
            
            const operation = feedback ? 'feedback processing' : 'report generation';
            
            // API 응답 로깅
            logger.log(`API Response Status: ${response.status}`);
            logger.log(`API Response Data:`, response.data);
            
            if (response.status === 200) {
                return {
                    success: true,
                    data: response.data,
                    message: `Weekly report ${operation} completed successfully`
                };
            } else {
                return {
                    success: false,
                    errorMessage: `HTTP ${response.status}: ${response.statusText}`,
                    data: response.data
                };
            }

        } catch (error) {
            return this.handleError('processWeeklyReport', error);
        }
    }


    /**
     * Check authentication token
     * @param {string} token - Authentication token
     * @returns {Promise<Object>} API response
     */
    async checkAuth(token) {
        try {
            const response = await this.httpRequest(`${this.baseURL}/devportal/rest/api/auth/check`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return {
                success: response.status === 200 && response.data?.authenticated === true,
                data: response.data,
                message: 'Token verification successful'
            };

        } catch (error) {
            return this.handleError('checkAuth', error);
        }
    }

    /**
     * Handle API errors consistently
     * @param {string} operation - Operation name for logging
     * @param {Error} error - Error object
     * @returns {Object} Standardized error response
     */
    handleError(operation, error) {
        logger.error(`API Error in ${operation}:`, error);

        let errorMessage = 'Unknown error occurred';
        let errorDetails = {};

        if (error.status) {
            // Server responded with error status
            errorMessage = this.getStatusMessage(error.status);
            errorDetails = {
                status: error.status,
                statusText: error.statusText,
                data: error.data
            };
        } else if (error.message) {
            // Network error or other error
            errorMessage = error.message;
            errorDetails = {
                message: error.message
            };
        } else {
            // Fallback
            errorMessage = 'Request failed';
            errorDetails = {
                error: error.toString()
            };
        }

        return {
            success: false,
            errorMessage: errorMessage,
            errorDetails: errorDetails,
            operation: operation
        };
    }

    /**
     * Get user-friendly status messages
     * @param {number} status - HTTP status code
     * @returns {string} User-friendly message
     */
    getStatusMessage(status) {
        const statusMessages = {
            400: 'Invalid request format',
            401: 'Authentication required',
            403: 'Access denied',
            404: 'Service not found',
            408: 'Request timeout',
            429: 'Too many requests',
            500: 'Internal server error',
            502: 'Gateway error',
            503: 'Service unavailable',
            504: 'Gateway timeout'
        };

        return statusMessages[status] || `HTTP error ${status}`;
    }

}

module.exports = {
    ApiService
};