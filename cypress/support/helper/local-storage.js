export default class LocalStorage {
  static setLogin(accessToken) {
    localStorage.setItem('X3Rva2Vu', accessToken);
  }
}