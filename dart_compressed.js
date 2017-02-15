// Do not edit this file; automatically generated by build.py.
'use strict';


// Copyright 2014 Google Inc.  Apache License 2.0
Blockly.Dart=new Blockly.Generator("Dart");Blockly.Dart.addReservedWords("assert,break,case,catch,class,const,continue,default,do,else,enum,extends,false,final,finally,for,if,in,is,new,null,rethrow,return,super,switch,this,throw,true,try,var,void,while,with,print,identityHashCode,identical,BidirectionalIterator,Comparable,double,Function,int,Invocation,Iterable,Iterator,List,Map,Match,num,Pattern,RegExp,Set,StackTrace,String,StringSink,Type,bool,DateTime,Deprecated,Duration,Expando,Null,Object,RuneIterator,Runes,Stopwatch,StringBuffer,Symbol,Uri,Comparator,AbstractClassInstantiationError,ArgumentError,AssertionError,CastError,ConcurrentModificationError,CyclicInitializationError,Error,Exception,FallThroughError,FormatException,IntegerDivisionByZeroException,NoSuchMethodError,NullThrownError,OutOfMemoryError,RangeError,StackOverflowError,StateError,TypeError,UnimplementedError,UnsupportedError");
Blockly.Dart.ORDER_ATOMIC=0;Blockly.Dart.ORDER_UNARY_POSTFIX=1;Blockly.Dart.ORDER_UNARY_PREFIX=2;Blockly.Dart.ORDER_MULTIPLICATIVE=3;Blockly.Dart.ORDER_ADDITIVE=4;Blockly.Dart.ORDER_SHIFT=5;Blockly.Dart.ORDER_BITWISE_AND=6;Blockly.Dart.ORDER_BITWISE_XOR=7;Blockly.Dart.ORDER_BITWISE_OR=8;Blockly.Dart.ORDER_RELATIONAL=9;Blockly.Dart.ORDER_EQUALITY=10;Blockly.Dart.ORDER_LOGICAL_AND=11;Blockly.Dart.ORDER_LOGICAL_OR=12;Blockly.Dart.ORDER_IF_NULL=13;Blockly.Dart.ORDER_CONDITIONAL=14;
Blockly.Dart.ORDER_CASCADE=15;Blockly.Dart.ORDER_ASSIGNMENT=16;Blockly.Dart.ORDER_NONE=99;
Blockly.Dart.init=function(a){Blockly.Dart.definitions_=Object.create(null);Blockly.Dart.functionNames_=Object.create(null);Blockly.Dart.variableDB_?Blockly.Dart.variableDB_.reset():Blockly.Dart.variableDB_=new Blockly.Names(Blockly.Dart.RESERVED_WORDS_);var e=[];a=a.variableList;if(a.length){for(var b=0;b<a.length;b++)e[b]=Blockly.Dart.variableDB_.getName(a[b],Blockly.Variables.NAME_TYPE);Blockly.Dart.definitions_.variables="var "+e.join(", ")+";"}};
Blockly.Dart.finish=function(a){a&&(a=Blockly.Dart.prefixLines(a,Blockly.Dart.INDENT));a="main() {\n"+a+"}";var e=[],b=[],d;for(d in Blockly.Dart.definitions_){var c=Blockly.Dart.definitions_[d];c.match(/^import\s/)?e.push(c):b.push(c)}delete Blockly.Dart.definitions_;delete Blockly.Dart.functionNames_;Blockly.Dart.variableDB_.reset();return(e.join("\n")+"\n\n"+b.join("\n\n")).replace(/\n\n+/g,"\n\n").replace(/\n*$/,"\n\n\n")+a};Blockly.Dart.scrubNakedValue=function(a){return a+";\n"};
Blockly.Dart.quote_=function(a){a=a.replace(/\\/g,"\\\\").replace(/\n/g,"\\\n").replace(/\$/g,"\\$").replace(/'/g,"\\'");return"'"+a+"'"};
Blockly.Dart.scrub_=function(a,e){var b="";if(!a.outputConnection||!a.outputConnection.targetConnection){var d=a.getCommentText();(d=Blockly.utils.wrap(d,Blockly.Dart.COMMENT_WRAP-3))&&(b=a.getProcedureDef?b+Blockly.Dart.prefixLines(d+"\n","/// "):b+Blockly.Dart.prefixLines(d+"\n","// "));for(var c=0;c<a.inputList.length;c++)a.inputList[c].type==Blockly.INPUT_VALUE&&(d=a.inputList[c].connection.targetBlock())&&(d=Blockly.Dart.allNestedComments(d))&&(b+=Blockly.Dart.prefixLines(d,"// "))}c=a.nextConnection&&
a.nextConnection.targetBlock();c=Blockly.Dart.blockToCode(c);return b+e+c};
Blockly.Dart.getAdjusted=function(a,e,b,d,c){b=b||0;c=c||Blockly.Dart.ORDER_NONE;a.workspace.options.oneBasedIndex&&b--;var g=a.workspace.options.oneBasedIndex?"1":"0";a=b?Blockly.Dart.valueToCode(a,e,Blockly.Dart.ORDER_ADDITIVE)||g:d?Blockly.Dart.valueToCode(a,e,Blockly.Dart.ORDER_UNARY_PREFIX)||g:Blockly.Dart.valueToCode(a,e,c)||g;if(Blockly.isNumber(a))a=parseInt(a,10)+b,d&&(a=-a);else{if(0<b){a=a+" + "+b;var f=Blockly.Dart.ORDER_ADDITIVE}else 0>b&&(a=a+" - "+-b,f=Blockly.Dart.ORDER_ADDITIVE);
d&&(a=b?"-("+a+")":"-"+a,f=Blockly.Dart.ORDER_UNARY_PREFIX);f=Math.floor(f);c=Math.floor(c);f&&c>=f&&(a="("+a+")")}return a};