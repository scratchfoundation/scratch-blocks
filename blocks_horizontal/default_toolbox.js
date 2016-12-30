/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Massachusetts Institute of Technology
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

goog.provide('Blockly.Blocks.defaultToolbox');

goog.require('Blockly.Blocks');

/**
 * @fileoverview Provide a default toolbox XML.
 */

Blockly.Blocks.defaultToolbox = '<xml id="toolbox-categories" style="display: none" colour="#FFD500" secondaryColour="#CC9900">' +
    '<category name="Events" colour="#FFD500" secondaryColour="#CC9900">' +
        '<block type="event_whenflagclicked"></block>' +
        '<block type="event_whenthisspriteclicked"></block>' +
        '<block type="event_bump"></block>' +
        '<block type="event_whenbroadcastreceived">' +
        '<value name="CHOICE">' +
        '<shadow type="dropdown_whenbroadcast">' +
        '<field name="CHOICE">blue</field>' +
        '</shadow>' +
        '</value>' +
        '</block>' +
        '<block type="event_broadcast">' +
        '<value name="CHOICE">' +
        '<shadow type="dropdown_broadcast">' +
        '<field name="CHOICE">blue</field>' +
        '</shadow>' +
        '</value>' +
        '</block>' +
    '</category>' +
    '<category name="Control" colour="#FFAB19" secondaryColour="#CF8B17">' +
        '<block type="control_forever"></block>' +
        '<block type="control_repeat">' +
        '<value name="TIMES">' +
        '<shadow type="math_whole_number">' +
        '<field name="NUM">4</field>' +
        '</shadow>' +
        '</value>' +
        '</block>' +
        '<block type="control_stop"></block>' +
        '<block type="control_wait">' +
        '<value name="DURATION">' +
        '<shadow type="math_positive_number">' +
        '<field name="NUM">1</field>' +
        '</shadow>' +
        '</value>' +
        '</block>' +
    '</category>' +
    '<category name="Wedo" colour="#C0C0C0" secondaryColour="#808080">' +
        '<block type="wedo_setcolor">' +
        '<value name="CHOICE">' +
        '<shadow type="dropdown_wedo_setcolor">' +
        '<field name="CHOICE">mystery</field>' +
        '</shadow>' +
        '</value>' +
        '</block>' +
        '<block type="wedo_motorclockwise">' +
        '<value name="DURATION">' +
        '<shadow type="math_positive_number">' +
        '<field name="NUM">1</field>' +
        '</shadow>' +
        '</value>' +
        '</block>' +
        '<block type="wedo_motorcounterclockwise">' +
        '<value name="DURATION">' +
        '<shadow type="math_positive_number">' +
        '<field name="NUM">1</field>' +
        '</shadow>' +
        '</value>' +
        '</block>' +
        '<block type="wedo_motorspeed">' +
        '<value name="CHOICE">' +
        '<shadow type="dropdown_wedo_motorspeed">' +
        '<field name="CHOICE">fast</field>' +
        '</shadow>' +
        '</value>' +
        '</block>' +
        '<block type="wedo_whentilt">' +
        '<value name="CHOICE">' +
        '<shadow type="dropdown_wedo_whentilt">' +
        '<field name="CHOICE">forward</field>' +
        '</shadow>' +
        '</value>' +
        '</block>' +
        '<block type="wedo_whendistanceclose"></block>' +
        '</category>' +
        '<category name="Motion" colour="#4C97FF" secondaryColour="#3373CC">'+
          '<block type="motion_movesteps">'+
            '<value name="STEPS">'+
              '<shadow type="math_number">'+
                '<field name="NUM">10</field>'+
              '</shadow>'+
            '</value>'+
          '</block>'+
          '<block type="motion_moveup">'+
            '<value name="STEPS">'+
              '<shadow type="math_number">'+
                '<field name="NUM">10</field>'+
              '</shadow>'+
            '</value>'+
          '</block>'+
          '<block type="motion_hop">'+
            '<value name="STEPS">'+
              '<shadow type="math_number">'+
                '<field name="NUM">10</field>'+
              '</shadow>'+
            '</value>'+
          '</block>'+
          '<block type="motion_movedown">'+
            '<value name="STEPS">'+
              '<shadow type="math_number">'+
                '<field name="NUM">10</field>'+
              '</shadow>'+
            '</value>'+
          '</block>'+
          '<block type="motion_moveback">'+
            '<value name="STEPS">'+
              '<shadow type="math_number">'+
                '<field name="NUM">10</field>'+
              '</shadow>'+
            '</value>'+
          '</block>'+
          '<block type="motion_turnright">'+
            '<value name="DEGREES">'+
              '<shadow type="math_number">'+
                '<field name="NUM">15</field>'+
              '</shadow>'+
            '</value>'+
          '</block>'+
          '<block type="motion_turnleft">'+
            '<value name="DEGREES">'+
              '<shadow type="math_number">'+
                '<field name="NUM">15</field>'+
              '</shadow>'+
            '</value>'+
          '</block>'+
          '<block type="motion_home"></block>'+
        '</category>'+
        '<category name="Looks" colour="#9966FF" secondaryColour="#774DCB">'+
          '<block type="looks_grow">'+
            '<value name="CHANGE">'+
              '<shadow type="math_number">'+
                '<field name="NUM">10</field>'+
              '</shadow>'+
            '</value>'+
          '</block>'+
          '<block type="looks_shrink">'+
            '<value name="CHANGE">'+
              '<shadow type="math_number">'+
                '<field name="NUM">10</field>'+
              '</shadow>'+
            '</value>'+
          '</block>'+
          '<block type="looks_reset"></block>'+
          '<block type="looks_show"></block>'+
          '<block type="looks_hide"></block>'+
          '<block type="looks_say">'+
            '<value name="MESSAGE">'+
              '<shadow type="text">'+
                '<field name="TEXT">Hi</field>'+
              '</shadow>'+
            '</value>'+
          '</block>'+
        '</category>'+
        '</xml>' +
        '<xml id="toolbox-simple" style="display: none">' +
        '<block type="event_whenflagclicked"></block>' +
        '<block type="event_whenbroadcastreceived">' +
        '<value name="CHOICE">' +
        '<shadow type="dropdown_whenbroadcast">' +
        '<field name="CHOICE">blue</field>' +
        '</shadow>' +
        '</value>' +
        '</block>' +
        '<block type="event_broadcast">' +
        '<value name="CHOICE">' +
        '<shadow type="dropdown_broadcast">' +
        '<field name="CHOICE">blue</field>' +
        '</shadow>' +
        '</value>' +
        '</block>' +
        '<block type="control_forever"></block>' +
        '<block type="control_repeat">' +
        '<value name="TIMES">' +
        '<shadow type="math_whole_number">' +
        '<field name="NUM">4</field>' +
        '</shadow>' +
        '</value>' +
        '</block>' +
        '<block type="control_stop"></block>' +
        '<block type="control_wait">' +
        '<value name="DURATION">' +
        '<shadow type="math_positive_number">' +
        '<field name="NUM">1</field>' +
        '</shadow>' +
        '</value>' +
        '</block>' +
    '</xml>';
