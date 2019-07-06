/**
 * Created by Riven on 7/14/2016.
 */

'use strict';

goog.provide('Blockly.Arduino.operator');

goog.require('Blockly.Arduino');

Blockly.Arduino['math_number'] = function(block) {
    // Numeric value.
    var code = parseFloat(block.getFieldValue('NUM'));
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['text'] = function(block) {
    // Text value.
    var code = Blockly.Arduino.quote_(block.getFieldValue('TEXT'));
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['operator_random'] = function(block) {
    var arg0 = Blockly.Arduino.valueToCode(block, 'FROM', Blockly.Arduino.ORDER_HIGH ) || '0';
    var arg1 = Blockly.Arduino.valueToCode(block, 'TO', Blockly.Arduino.ORDER_HIGH ) || '0';
    var code = "random("+arg0+","+arg1+")";
    return [code, Blockly.Arduino.ORDER_HIGH];
};

Blockly.Arduino['operator_compare'] = function(block) {
    var oplist = {"operator_gt":">","operator_equals":"==","operator_lt":"<"};
    var arg0 = Blockly.Arduino.valueToCode(block, 'OPERAND1', Blockly.Arduino.ORDER_HIGH ) || '0';
    var arg1 = Blockly.Arduino.valueToCode(block, 'OPERAND2', Blockly.Arduino.ORDER_HIGH ) || '0';
    var op = oplist[block.type];
    var code = arg0+op+arg1;
    return [code, Blockly.Arduino.ORDER_RELATIONAL];
};


// common
Blockly.Arduino['operator_arithmetic'] = function(block) {
    var oplist = {"operator_add":"+","operator_subtract":"-","operator_multiply":"*","operator_divide":"/"};
    // Numeric value.
    var argument0 = Blockly.Arduino.valueToCode(block, 'NUM1', Blockly.Arduino.ORDER_HIGH) || '0';
    var argument1 = Blockly.Arduino.valueToCode(block, 'NUM2', Blockly.Arduino.ORDER_HIGH) || '0';
    var order = Blockly.Arduino.ORDER_ADDITIVE;
    if(block.type == "operator_multiply" || block.type == "operator_divide"){
        order-=1;
    }
    var op = oplist[block.type];
    var code = argument0 + op + argument1;
    return [code, order];
};



Blockly.Arduino['operator_add'] = Blockly.Arduino['operator_arithmetic'];
Blockly.Arduino['operator_subtract'] = Blockly.Arduino['operator_arithmetic'];
Blockly.Arduino['operator_multiply'] = Blockly.Arduino['operator_arithmetic'];
Blockly.Arduino['operator_divide'] = Blockly.Arduino['operator_arithmetic'];

Blockly.Arduino['operator_gt'] = Blockly.Arduino['operator_compare'];
Blockly.Arduino['operator_equals'] = Blockly.Arduino['operator_compare'];
Blockly.Arduino['operator_lt'] = Blockly.Arduino['operator_compare'];
Blockly.Arduino['math_angle'] = Blockly.Arduino['math_number'];
Blockly.Arduino['math_positive_number'] = Blockly.Arduino['math_number'];
Blockly.Arduino['math_whole_number'] = Blockly.Arduino['math_number'];