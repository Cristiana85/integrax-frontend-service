export class ClientProfile {

  private agent = window.navigator.userAgent.toLowerCase();

  public VERSION: any;

  public IS_EDGE: boolean;

  public IS_OPERA: boolean;

  public IS_CHROME: boolean;

  public IS_IE: boolean;

  public IS_FIREFOX: boolean;

  public IS_SAFARI: boolean;

  constructor() {
    this.IS_EDGE = this.agent.indexOf('edge') > -1;
    this.IS_OPERA = this.agent.indexOf('opr') > -1 && !!(<any>window).opr;
    this.IS_CHROME = this.agent.indexOf('chrome') > -1 && !!(<any>window).chrome;
    this.IS_IE = this.agent.indexOf('trident') > -1;
    this.IS_FIREFOX = this.agent.indexOf('firefox') > -1;
    this.IS_SAFARI = this.agent.indexOf('safari') > -1;
    this.VERSION = this.getBrowserVersion();
  }

  public getBrowserVersion() {
    const userAgent: any = navigator.userAgent;
    let tempMatch: any;
    let versionMatch: any =
      userAgent.match(
        /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i
      ) || [];
    if (/trident/i.test(versionMatch[1])) {
      tempMatch = /\brv[ :]+(\d+)/g.exec(userAgent) || [];
      return 'IE ' + (tempMatch[1] || '');
    }
    if (versionMatch[1] === 'Chrome') {
      tempMatch = userAgent.match(/\b(OPR|Edge)\/(\d+)/);
      if (tempMatch != null) {
        return tempMatch.slice(1).join(' ').replace('OPR', 'Opera');
      }
    }
    versionMatch = versionMatch[2]
      ? [versionMatch[1], versionMatch[2]]
      : [navigator.appName, navigator.appVersion, '-?'];
    if ((tempMatch = userAgent.match(/version\/(\d+)/i)) != null)
      versionMatch.splice(1, 1, tempMatch[1]);
    return versionMatch;
  }

}
