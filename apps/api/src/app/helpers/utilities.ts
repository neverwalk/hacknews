export class Utility {
  public static getBaseUrlFromUrl(url) {
    const pathArray = url.split('/');
    const protocol = pathArray[0];
    const host = pathArray[2];
    const baseUrl = protocol + '//' + host;
    return baseUrl;
  }
}
