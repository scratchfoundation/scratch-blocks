/**
 * Created by Riven on 7/15/2016.
 */
'use strict';

goog.provide('Blockly.Arduino.control');

goog.require('Blockly.Arduino');

Blockly.Arduino['control_wait'] = function(block) {
    var order = Blockly.Arduino.ORDER_HIGH;
    var arg0 = Blockly.Arduino.valueToCode(block, 'DURATION', order);
    var ms = arg0+"*1000";
    var code = Blockly.Arduino.tab()+"delay("+ms+")"+Blockly.Arduino.END;
    return code;
};

Blockly.Arduino['control_repeat'] = function(block) {
    var order = Blockly.Arduino.ORDER_HIGH;
    var repeats = Blockly.Arduino.valueToCode(block, 'TIMES', order);
    var branch = Blockly.Arduino.statementToCode(block, 'SUBSTACK');
    branch = Blockly.Arduino.addLoopTrap(branch, block.id);

    var code = Blockly.Arduino.tab()+"for(int i=0;i<"+repeats+";i++){\n";
    Blockly.Arduino.tabPos++;
    code+=branch;
    Blockly.Arduino.tabPos--;
    code+=Blockly.Arduino.tab()+"}\n";
    return code;
};

Blockly.Arduino['control_forever'] = function(block) {
    // if first forever, treat it as loop
    if(Blockly.Arduino.codeStage!=Blockly.Arduino.Loop) {
        Blockly.Arduino.codeStage = Blockly.Arduino.Loop;
        Blockly.Arduino.tabPos = 0;
        var order = Blockly.Arduino.ORDER_HIGH;
        var branch = Blockly.Arduino.statementToCode(block, 'SUBSTACK');
        branch = Blockly.Arduino.addLoopTrap(branch, block.id);
        code="\n}\n"; // finish up setup
        code+="\nvoid loop(){\n";
        code+=branch;
    }else{
        var code = Blockly.Arduino.tab()+"while(1){\n";
        Blockly.Arduino.tabPos++;
        var branch = Blockly.Arduino.statementToCode(block, 'SUBSTACK');
        branch = Blockly.Arduino.addLoopTrap(branch, block.id);
        code+=branch;
        Blockly.Arduino.tabPos--;
        code+=Blockly.Arduino.tab()+"}\n";
    }
    return code;
};

Blockly.Arduino['control_if'] = function(block) {
    var argument = Blockly.Arduino.valueToCode(block, 'CONDITION',Blockly.Arduino.ORDER_NONE) || 'false';

    var branch = Blockly.Arduino.statementToCode(block, 'SUBSTACK');
    branch = Blockly.Arduino.addLoopTrap(branch, block.id);

    var code = Blockly.Arduino.tab()+"if("+argument+"){\n";
    Blockly.Arduino.tabPos++;
    code+=branch;
    Blockly.Arduino.tabPos--;
    code+=Blockly.Arduino.tab()+"}\n";
    return code;
};


Blockly.Arduino['control_if_else'] = function(block) {
    var argument = Blockly.Arduino.valueToCode(block, 'CONDITION',Blockly.Arduino.ORDER_NONE) || 'false';

    var branch = Blockly.Arduino.statementToCode(block, 'SUBSTACK');
    branch = Blockly.Arduino.addLoopTrap(branch, block.id);

    var branch2 = Blockly.Arduino.statementToCode(block, 'SUBSTACK2');
    branch2 = Blockly.Arduino.addLoopTrap(branch, block.id);

    var code = Blockly.Arduino.tab()+"if("+argument+"){\n";
    Blockly.Arduino.tabPos++;
    code+=branch;
    Blockly.Arduino.tabPos--;
    code+=Blockly.Arduino.tab()+"}else{\n";
    Blockly.Arduino.tabPos++;
    code+=branch2;
    Blockly.Arduino.tabPos--;
    code+=Blockly.Arduino.tab()+"}\n";
    return code;
};

Blockly.Arduino['looks_say'] = function(block){
    var str = Blockly.Arduino.valueToCode(block, 'MESSAGE',Blockly.Arduino.ORDER_ATOMIC);
    var code = Blockly.Arduino.tab()+"Serial.println(String('"+str+"'));\n";
    return code;
};
