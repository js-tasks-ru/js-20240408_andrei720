/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
    const pathEntries = path.split('.');

    function getValue(object, currentPos = 0) {
        if (Object.hasOwn(object, pathEntries[currentPos])) {
            if (currentPos == pathEntries.length - 1) {
                return object[pathEntries[currentPos]]
            }
            return getValue(object[pathEntries[currentPos]], ++currentPos);
        }
    }

    return getValue
}
