export class Utility {

  public static getDataFromStorage(key) {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    } else {
      return [];
    }
  }

  public static setDataToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  public static clone(object) {
    return JSON.parse(JSON.stringify(object));
  }

  public static resolveUrls(...args: string[]) {
    const result = args.join('/');
    const baseUrl = new URL(result).origin;
    return `${baseUrl}${result.substring(baseUrl.length).replace(new RegExp('//', 'g'), '/')}`;
  }
}
