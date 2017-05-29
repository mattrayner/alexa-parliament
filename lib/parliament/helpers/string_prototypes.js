"use strict"

module.exports = function () {
    String.prototype.toProperCase = function () {
        return this.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    };

    String.prototype.toCapLetter = function () {
        return this.charAt(0).toUpperCase() + this.substr(1);
    };
};
