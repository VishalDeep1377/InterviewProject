/**
 * Currency Service
 * Fetches live exchange rates for USD to GBP conversion using native fetch.
 */
class CurrencyService {
    constructor() {
        this.cache = {
            rate: 0.79, // Initial fallback (1 USD = 0.79 GBP)
            lastUpdated: null
        };
    }

    async getLiveRate() {
        try {
            // Attempt to fetch from Frankfurter (Free, no key required)
            const response = await fetch('https://api.frankfurter.app/latest?from=USD&to=GBP');
            if (response.ok) {
                const data = await response.json();
                this.cache.rate = data.rates.GBP;
                this.cache.lastUpdated = new Date();
                console.log(`[CurrencyService] Live Rate Updated: 1 USD = ${this.cache.rate} GBP`);
            }
        } catch (error) {
            console.warn('[CurrencyService] API failed, using cached/fallback rate:', this.cache.rate);
        }
        return this.cache.rate;
    }
}

module.exports = new CurrencyService();
