// noinspection JSUnusedGlobalSymbols

/*
 *  const validationSchema = shape({
 *    firstKey: decimal(), // params.length === 0
 *    secondKey: decimal(1), // params.length === 1
 *    thirdKey: decimal(1, 2), // params.length === 2
 *  })
 * const dtoIn = {
 *   firstKey: 0,123456789101112
 * }
 */


const Decimal = require("decimal.js");
const ValidationResult = require("./validation-result");

const Errors = {
  invalidDecimalValue: {
    code: "doubleNumber.e001",
    message: "The value is not a valid decimal number."
  },
  isOverMaxNumOfDigits: {
    code: "doubleNumber.e002",
    message: "The value exceeded maximum number of digits."
  },
  isOverMaxNumOfDecPlaces: {
    code: "doubleNumber.e003",
    message: "The value exceeded maximum number of decimal places."
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
    number = this._validateDecNumber(value, result, Errors.invalidDecimalValue);
    if (!number) { //If number is 0 it fullfills the condition - I think it is wrong
      return result;
    }
    this._checkPrecisionGreaterThanValue(number, result, Errors.isOverMaxNumOfDigits);

    this._checkDecPlacesGreaterThanValue(number, result, Errors.isOverMaxNumOfDecPlaces);

    return result;
  }

  _checkDecPlacesGreaterThanValue(number, result, error) {
    if (this.params.length !== 2) {
      return result;
    }
    if (number.decimalPlaces() > this.decimalPlaces) {
      result.addInvalidTypeError(error.code, error.message);
    }
  }

  _checkPrecisionGreaterThanValue(number, result, error) {
    if (number.precision(true) > this.precision) {
      result.addInvalidTypeError(error.code, error.message);
    }
    return number;
  }

  _validateDecNumber(value, result, error) {
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
