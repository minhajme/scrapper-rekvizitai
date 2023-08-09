String.prototype.wrap = function(character) {
    return `${character}${this}${character}`;
};
String.prototype.isNumeric = function() {
  return /^\d+$/.test(this);
}
