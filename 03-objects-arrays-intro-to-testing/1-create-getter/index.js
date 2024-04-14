/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
    const pathEntries = path.split('.');

    function getValue(object, currentPos = 0) {
        for (const [key, val] of Object.entries(object)) {
            if (key == pathEntries[currentPos]) {
                if (currentPos == pathEntries.length - 1) {
                    return val
                }
                return getValue(val, ++currentPos);
            }
        } 
    }

    return getValue
}
