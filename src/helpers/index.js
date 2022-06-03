/*eslint no-invalid-this: 0*/

/**
 * Get the appropriate Mx logger
 * @returns
 */
function getLogger() {
    return mx && mx.logger && mx.logger.debug ? mx.logger : logger;
}

/**
 * Logs using the Mendix logger
 *
 * @export
 * @param {string} methodName
 * @param {...any} args
 */
export function log(methodName, ...args) {
    getLogger().debug(`${this.id}.${methodName}`, args.length ? args[ 0 ] : '');
}

/**
 * Log warnings using the Mendix logger
 *
 * @export
 * @param {string} methodName
 * @param {...any} args
 */
export function warn(methodName, ...args) {
    getLogger().warn(`${this.id}.${methodName}`, args.length ? args[ 0 ] : '');
}

/**
 * Runs a callback and logs the method where it comes from
 *
 * @export
 * @param {() => {}} cb
 * @param {string} from
 */
export function runCallback(cb, from) {
    log.call(this, '_callback', from ? `from ${from}` : '');
    if (cb && 'function' === typeof cb) {
        cb();
    }
}
