import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(Cypress.env('TIMEZONE'));

export default class DateTime {
  /**
   * Get current date and time \
   * Timezone follows Cypress.env('TIMEZONE')
   *
   * @returns {string} date and time in YYYY-MM-DD HH:mm:ss
   */
  static getCurrentDateAndTime(formatType = 'YYYY-MM-DD HH:mm:ss') {
    return dayjs().tz().format(formatType);
  }

  /**
   * Get current timestamp \
   * Timezone follows Cypress.env('TIMEZONE')
   *
   * @returns {string} timestamp in hh:mm:ss
   */
  static getCurrentTimeStamp(formatType = 'hh:mm:ss') {
    return dayjs().tz().format(formatType);
  }

  /**
   * Get current date + Add day \
   * Timezone follows Cypress.env('TIMEZONE')
   *
   * @returns {string} date in YYYY-MM-DD
   */
  static getAddDayDate(add, date = null) {
    const customDate = (date === null) ? dayjs() : dayjs(date);
    return customDate.tz().add(add, 'day').format('YYYY-MM-DD');
  }

  /**
   * Get current date - substract day \
   * Timezone follows Cypress.env('TIMEZONE')
   *
   * @returns {string} date in YYYY-MM-DD
   */
  static getSubtractDayDate(subtract, date = null) {
    const customDate = (date === null) ? dayjs() : dayjs(date);
    return customDate.tz().subtract(subtract, 'day').format('YYYY-MM-DD');
  }

  /**
   * Get current date - substract month \
   * Timezone follows Cypress.env('TIMEZONE')
   *
   * @returns {string} date in YYYY-MM-DD
   */
  static getSubtractMonthDate(subtract, date = null) {
    const customDate = (date === null) ? dayjs() : dayjs(date);
    return customDate.tz().subtract(subtract, 'month').format('YYYY-MM-DD');
  }

  /**
   * Get current date + Add Month \
   * Timezone follows Cypress.env('TIMEZONE')
   *
   * @returns {string} date in YYYY-MM-DD
   */
  static getAddMonthDate(add, date = null) {
    const customDate = (date === null) ? dayjs() : dayjs(date);
    return customDate.tz().add(add, 'month').format('YYYY-MM-DD');
  }

  /**
   * Get current timestamp \
   * Timezone follows Cypress.env('TIMEZONE')
   *
   * @returns {string} date in MMM
   */
  static getCurrentMonthDate() {
    return dayjs().tz().format('MMM');
  }

  /**
   * Get current timestamp \
   * Timezone follows Cypress.env('TIMEZONE')
   *
   * @returns {string} date in YYYY
   */
  static getCurrentMonthDate() {
    return dayjs().tz().month();
  }

  /**
   * Get current timestamp \
   * Timezone follows Cypress.env('TIMEZONE')
   *
   * @returns {string} date in YYYY
   */
  static getCurrentYearDate() {
    return dayjs().tz().year();
  }

  static formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
    return dayjs(date).tz().format(format);
  }

  static DateDiff(dateParams1, dateParams2) {
    const date1 = new Date(dateParams1);
    const date2 = new Date(dateParams2);
    date1.setHours(0);
    date1.setMinutes(0, 0, 0);
    date2.setHours(0);
    date2.setMinutes(0, 0, 0);
    const datediff = Math.abs(date1.getTime() - date2.getTime()); // difference
    return parseInt(datediff / (24 * 60 * 60 * 1000), 10); // Convert values days and return value
  }
}
