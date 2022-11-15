// noinspection JSUnusedGlobalSymbols
const Decimal = require("decimal.js");
const ValidationResult = require("./validation-result");

const Errors = {
  InvalidDecimalValue: {
    CODE: "doubleNumber.e001",
    MESSAGE: "The value is not a valid decimal number."
  },
  IsOverMaxNumOfDigits: {
    CODE: "doubleNumber.e002",
    MESSAGE: "The value exceeded maximum number of digits."
  },
  IsOverMaxNumOfDecPlaces: {
    CODE: "doubleNumber.e003",
    MESSAGE: "The value exceeded maximum number of decimal places."
  }
};
const DEFAULT_PRECISION = 11;

/**
 * Matcher validates that string value represents a decimal number or null.
 * Decimal separator is always "."
 * In addition, it must comply to the rules described below.
 *
 * @param params - Matcher can take 0 to 2 parameters with following rules:
 * - no parameters: validates that number of digits does not exceed the maximum value of 11.
 * - one parameter: the parameter specifies maximum length of number for the above rule (parameter replaces the default value of 11)
 * - two parameters:
 *   -- first parameter represents the total maximum number of digits,
 *   -- the second parameter represents the maximum number of decimal places.
 *   -- both conditions must be met in this case.
 */
class DecimalNumberMatcher {
  constructor(...params) {
    this.params = params;
    this.precision = this.params[0] ?? DEFAULT_PRECISION;
    this.decimalPlaces = this.params[1];
  }

  match(value) {
    let result = new ValidationResult();
    let number;
    if (value === null) {
      return result;
    }
    number = this._getDecNumber(value, result, Errors.InvalidDecimalValue);
    if (!number) { //If number is 0 it fullfills the condition - I think it is wrong, but it was in original code
      return result;
    }
    this._addErrorIntoResult(this._isPrecisionGreaterThanValue(number), Errors.IsOverMaxNumOfDigits, result);
    this._addErrorIntoResult(this._isDecPlacesGreaterThanValue(number), Errors.IsOverMaxNumOfDecPlaces, result);

    return result;
  }

  _addErrorIntoResult(checkResult, error, result){
    if(checkResult){
      result.addInvalidTypeError(error.code, error.message);
    }
  }
  _isDecPlacesGreaterThanValue(number) {
    if (this.params.length !== 2) {
      return false;
    }
    return number.decimalPlaces() > this.decimalPlaces;
  }

  _isPrecisionGreaterThanValue(number) {
    return number.precision(true) > this.precision;
  }

  _getDecNumber(value, result, error) {
    let number;
    try {
      number = new Decimal(value);
    } catch (e) {
      number = null;
      result.addInvalidTypeError(error.code, error.message);
    }
    return number;
  }
}

module.exports = DecimalNumberMatcher;
