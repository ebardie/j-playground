// code

"use strict";

var ecm;
var ecmLast;

// ---------------------------------------------------------------------
function clearedit() {
 ecm.getDoc().setValue("");
 ecm.focus();
}

// ---------------------------------------------------------------------
function ecminitvalue() {
 if (ecmLast)
  ecm.setValue(ecmLast);
 else
  ecm.setValue(Exams[0]);
}

// ---------------------------------------------------------------------
function ecmrunall() {
 ecmsnap();
 docmds(readall(), true);
}

// ---------------------------------------------------------------------
function ecmrunallx() {
 clearterm();
 ecmrunall();
}

// ---------------------------------------------------------------------
function ecmrunline() {
 ecmrunline_do(true, false);
}

// ---------------------------------------------------------------------
function ecmrunlineshow() {
 ecmrunline_do(true, true);
}

// ---------------------------------------------------------------------
// log, show
function ecmrunline_do(g, s) {
 ecmsnap();
 docmdline(readentry(), g, s);
}

// ---------------------------------------------------------------------
function ecmset(s) {
 ecm.getDoc().setValue(s);
 ecm.focus();
}

// ---------------------------------------------------------------------
function ecmsnap() {
 ecmLast = ecm.getDoc().getValue();
}

// ---------------------------------------------------------------------
function editlast() {
 if (ecmLast) {
  ecm.getDoc().setValue(ecmLast);
  ecm.focus();
 }
}

// ---------------------------------------------------------------------
function editclose() {
 layout.editorclose();
}

// ---------------------------------------------------------------------
function editopen() {
 ecm.refresh();
 ecm.focus();
}

// ----------------------------------------------------------------------
function getline(p) {
 if (p >= ecm.lineCount()) return undefined;
 return ecm.getLine(p).replace("\r", "").replace("\t", " ");
};

// ---------------------------------------------------------------------
function initedit() {
 ecm = cmopen("side", "j");

 /* beautify preserve:start */
 var keys = {
 "F1": menuvocab,
 "Ctrl-D": dlog_select,
 "Ctrl-R": ecmrunall,
 "Ctrl-Enter": ecmrunline,
 "Ctrl-F1": context,
 "Shift-Ctrl-F1": nvcontext,
 "Shift-Ctrl-T": clearterm,
 "Shift-F1": menunuvoc,
 "Shift-Ctrl-Down": dummy,
 "Shift-Ctrl-Up": dummy,
 "Shift-Ctrl-C": layout.centerpanes,
 "Shift-Ctrl-L": swappanes,
 "Shift-Ctrl-R": ecmrunallx,
 "Shift-Ctrl-Enter": ecmrunlineshow
 };
 /* beautify preserve:end */

 ecm.setOption("extraKeys", keys);
 ecm.setOption("matchBrackets", true);
 ecm.on("focus", function() {
  lastfocus = ecm;
 });

 ecminitvalue();
}

// ----------------------------------------------------------------------
// return if line is start of multiline definition
// checks only most common cases using standard library
function ismultiline(t) {
 var s = t.trim();
 if (s.length === 0) return false;
 if ("Note'" === s.substring(0, 5)) return true;
 s = splitblankJ(s);
 if ("Note" === s[0]) return true;
 var len = s.length;
 var num = ["0", "1", "2", "3", "4"];
 var def = ["noun", "adverb", "conjunction", "verb", "monad", "dyad"];
 for (var i = 1; i < len; i++) {
  if (s[i] !== "define" &&
   (s[i] !== ":" || i === len - 1 || s[i + 1] !== "0")) continue;
  if (has(def, s[i - 1]) || has(num, s[i - 1])) return true;
 }
 return false;
}

// ----------------------------------------------------------------------
function isNB(e) {
 return "NB." === e.trim().substring(0, 3);
}

// ----------------------------------------------------------------------
// Note or unassigned multiline noun explicit definition
function isNote(t) {
 var s = t.trim();
 if (s.length === 0) return false;
 if ("Note'" === s.substring(0, 5)) return true;
 var s = splitblankJ(s);
 if (s.length < 2) return false;
 if (s[0] === "Note") return true;
 if (!(s[0] === "0" || s[0] === "noun")) return false;
 return s[1] === "define" || (s[1] === ":" && s[2] === ":");
}

// ----------------------------------------------------------------------
// returns next entry from current position
function readentry() {
 var r = readentry1(ecm.getCursor().line);
 ecm.scrollIntoView(r[0], 0);
 ecm.setCursor(r[0], 1e8);
 return r[1];
}

// ----------------------------------------------------------------------
// returns next line, entry from given position
function readentry1(p) {
 var r = getline(p++);
 if (r.trim().length === 0 || !ismultiline(r)) return [p, r];
 while (p < ecm.lineCount()) {
  var s = getline(p++);
  r += "\n" + s;
  if (s === ")") break;
 }
 return [p, r];
};

// ----------------------------------------------------------------------
function readall() {
 var p = 0;
 var r = [];
 var s;
 while (p < ecm.lineCount()) {
  s = readentry1(p);
  p = s[0];
  r.push(s[1]);
 }
 return r;
}

// ----------------------------------------------------------------------
function remNB(s) {
 s = s.substring(3 + s.indexOf("NB."));
 if (" " === s.substring(0, 1))
  s = s.substring(1);
 return s;
}