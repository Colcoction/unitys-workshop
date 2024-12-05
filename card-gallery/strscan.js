/**
 * Taken from {@link https://github.com/sstephenson/strscan-js}.
 * 
 * Copyright (c) 2010 Sam Stephenson
 * 
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
(function() {
    var StringScanner;
    ((typeof exports !== "undefined" && exports !== null) ? exports : this).StringScanner = (function() {
      StringScanner = function(source) {
        this.source = source.toString();
        this.reset();
        return this;
      };
      StringScanner.prototype.scan = function(regexp) {
        var matches;
        return (matches = regexp.exec(this.getRemainder())) && matches.index === 0 ? this.setState(matches, {
          head: this.head + matches[0].length,
          last: this.head
        }) : this.setState([]);
      };
      StringScanner.prototype.scanUntil = function(regexp) {
        var matches;
        if (matches = regexp.exec(this.getRemainder())) {
          this.setState(matches, {
            head: this.head + matches.index + matches[0].length,
            last: this.head
          });
          return this.source.slice(this.last, this.head);
        } else {
          return this.setState([]);
        }
      };
      StringScanner.prototype.scanChar = function() {
        return this.scan(/./);
      };
      StringScanner.prototype.skip = function(regexp) {
        if (this.scan(regexp)) {
          return this.match.length;
        }
      };
      StringScanner.prototype.skipUntil = function(regexp) {
        if (this.scanUntil(regexp)) {
          return this.head - this.last;
        }
      };
      StringScanner.prototype.check = function(regexp) {
        var matches;
        return (matches = regexp.exec(this.getRemainder())) && matches.index === 0 ? this.setState(matches) : this.setState([]);
      };
      StringScanner.prototype.checkUntil = function(regexp) {
        var matches;
        if (matches = regexp.exec(this.getRemainder())) {
          this.setState(matches);
          return this.source.slice(this.head, this.head + matches.index + matches[0].length);
        } else {
          return this.setState([]);
        }
      };
      StringScanner.prototype.peek = function(length) {
        return this.source.substr(this.head, (typeof length !== "undefined" && length !== null) ? length : 1);
      };
      StringScanner.prototype.getSource = function() {
        return this.source;
      };
      StringScanner.prototype.getRemainder = function() {
        return this.source.slice(this.head);
      };
      StringScanner.prototype.getPosition = function() {
        return this.head;
      };
      StringScanner.prototype.hasTerminated = function() {
        return this.head === this.source.length;
      };
      StringScanner.prototype.getPreMatch = function() {
        if (this.match) {
          return this.source.slice(0, this.head - this.match.length);
        }
      };
      StringScanner.prototype.getMatch = function() {
        return this.match;
      };
      StringScanner.prototype.getPostMatch = function() {
        if (this.match) {
          return this.source.slice(this.head);
        }
      };
      StringScanner.prototype.getCapture = function(index) {
        return this.captures[index];
      };
      StringScanner.prototype.reset = function() {
        return this.setState([], {
          head: 0,
          last: 0
        });
      };
      StringScanner.prototype.terminate = function() {
        return this.setState([], {
          head: this.source.length,
          last: this.head
        });
      };
      StringScanner.prototype.concat = function(string) {
        return this.source += string;
      };
      StringScanner.prototype.unscan = function() {
        if (this.match) {
          return this.setState([], {
            head: this.last,
            last: 0
          });
        } else {
          throw "nothing to unscan";
        }
      };
      StringScanner.prototype.setState = function(matches, values) {
        var _a, _b;
        this.head = (typeof (_a = ((typeof values === "undefined" || values === null) ? undefined : values.head)) !== "undefined" && _a !== null) ? _a : this.head;
        this.last = (typeof (_b = ((typeof values === "undefined" || values === null) ? undefined : values.last)) !== "undefined" && _b !== null) ? _b : this.last;
        this.captures = matches.slice(1);
        return (this.match = matches[0]);
      };
      return StringScanner;
    })();
  })();
