/**
 * console.log(toCamelCase("hello_world")); // 输出 "helloWorld"
   console.log(toCamelCase("hello-world")); // 输出 "helloWorld"
   console.log(toCamelCase("HelloWorld")); // 输出 "helloWorld"
 * 转为驼峰
 * @param {*} str 
 * @returns 
 */
export function toCamelCase(str) {
    return str.replace(/[\s_-](\w)/g, function(match, p1) {
        return p1.toUpperCase();
    }).replace(/^[A-Z]/, function(match) {
        return match.toLowerCase();
    });
}

/**
 * 首字母大写的驼峰
 */
 export function toHeadUpperCaseCamelCase(str) {
    return str.replace(/[\s_-](\w)/g, function(match, p1) {
        return p1.toUpperCase();
    }).replace(/^[a-z]/, function(match) {
        return match.toUpperCase();
    });
}