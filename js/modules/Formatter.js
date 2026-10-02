export class Formatter {
  static suffixes = [
    '', 
    ' Thousand', ' Million', ' Billion', ' Trillion', ' Quadrillion', ' Quintillion', 
    ' Sextillion', ' Septillion', ' Octillion', ' Nonillion', ' Decillion',' Undecillion', 
    ' Duodecillion', ' Tredecillion', ' Quattuordecillion', ' Quindecillion', ' Sexdecillion', 
    ' Septendecillion', ' Octodecillion', ' Novemdecillion', ' Vigintillion'
  ];

  static format(value) {
    if (value === undefined || value === null || isNaN(value)) return '0';

    // Getallen onder 1000
    if (value < 1000) {
      return Number.isInteger(value) 
        ? value.toString() 
        : value.toFixed(1); // toont 1 decimaal voor getallen onder 1000
    }

    const tier = Math.floor(Math.log10(value) / 3);

    if (tier >= this.suffixes.length) {
      return value.toExponential(2).replace('+', '');
    }

    const suffix = this.suffixes[tier];
    const scale = Math.pow(10, tier * 3);
    const scaled = value / scale;

    // Behoud altijd x decimalen nu 0
    return scaled.toFixed(0) + suffix;
  }
}

console.log('Formatter.js.');