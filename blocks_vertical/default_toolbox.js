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

Blockly.Blocks.defaultToolbox = '<xml id="toolbox-categories" style="display: none">'+
  '<category name="Motion" colour="#4C97FF" secondaryColour="#3373CC">'+
    '<block type="motion_movesteps">'+
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
    '<block type="motion_pointindirection">'+
      '<value name="DIRECTION">'+
        '<shadow type="math_angle">'+
          '<field name="NUM">90</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="motion_pointtowards">'+
      '<value name="TOWARDS">'+
        '<shadow type="motion_pointtowards_menu">'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="motion_gotoxy">'+
      '<value name="X">'+
        '<shadow type="math_number">'+
          '<field name="NUM">0</field>'+
        '</shadow>'+
      '</value>'+
      '<value name="Y">'+
        '<shadow type="math_number">'+
          '<field name="NUM">0</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="motion_goto">'+
      '<value name="TO">'+
        '<shadow type="motion_goto_menu">'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="motion_glidesecstoxy">'+
      '<value name="SECS">'+
        '<shadow type="math_number">'+
          '<field name="NUM">1</field>'+
        '</shadow>'+
      '</value>'+
      '<value name="X">'+
        '<shadow type="math_number">'+
          '<field name="NUM">0</field>'+
        '</shadow>'+
      '</value>'+
      '<value name="Y">'+
        '<shadow type="math_number">'+
          '<field name="NUM">0</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="motion_changexby">'+
      '<value name="DX">'+
        '<shadow type="math_number">'+
          '<field name="NUM">10</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="motion_setx">'+
      '<value name="X">'+
        '<shadow type="math_number">'+
          '<field name="NUM">0</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="motion_changeyby">'+
      '<value name="DY">'+
        '<shadow type="math_number">'+
          '<field name="NUM">10</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="motion_sety">'+
      '<value name="Y">'+
        '<shadow type="math_number">'+
          '<field name="NUM">0</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="motion_ifonedgebounce"></block>'+
    '<block type="motion_setrotationstyle">'+
      '<value name="STYLE">'+
        '<shadow type="motion_setrotationstyle_menu"></shadow>'+
      '</value>'+
    '</block>'+
    '<block type="motion_xposition"></block>'+
    '<block type="motion_yposition"></block>'+
    '<block type="motion_direction"></block>'+
  '</category>'+
  '<category name="Looks" colour="#9966FF" secondaryColour="#774DCB">'+
    '<block type="looks_sayforsecs">'+
      '<value name="MESSAGE">'+
        '<shadow type="text">'+
          '<field name="TEXT">Hello!</field>'+
        '</shadow>'+
      '</value>'+
      '<value name="SECS">'+
        '<shadow type="math_number">'+
          '<field name="NUM">2</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="looks_say">'+
      '<value name="MESSAGE">'+
        '<shadow type="text">'+
          '<field name="TEXT">Hello!</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="looks_thinkforsecs">'+
      '<value name="MESSAGE">'+
        '<shadow type="text">'+
          '<field name="TEXT">Hmm...</field>'+
        '</shadow>'+
      '</value>'+
      '<value name="SECS">'+
        '<shadow type="math_number">'+
          '<field name="NUM">2</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="looks_think">'+
      '<value name="MESSAGE">'+
        '<shadow type="text">'+
          '<field name="TEXT">Hmm...</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="looks_show"></block>'+
    '<block type="looks_hide"></block>'+
    '<block type="looks_switchcostumeto">'+
      '<value name="COSTUME">'+
        '<shadow type="looks_costume"></shadow>'+
      '</value>'+
    '</block>'+
    '<block type="looks_nextcostume"></block>'+
    '<block type="looks_nextbackdrop"></block>'+
    '<block type="looks_switchbackdropto">'+
      '<value name="BACKDROP">'+
        '<shadow type="looks_backdrops"></shadow>'+
      '</value>'+
    '</block>'+
    '<block type="looks_switchbackdroptoandwait">'+
      '<value name="BACKDROP">'+
        '<shadow type="looks_backdrops"></shadow>'+
      '</value>'+
    '</block>'+
    '<block type="looks_changeeffectby">'+
      '<value name="EFFECT">'+
        '<shadow type="looks_effectmenu"></shadow>'+
      '</value>'+
      '<value name="CHANGE">'+
        '<shadow type="math_number">'+
          '<field name="NUM">10</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="looks_seteffectto">'+
      '<value name="EFFECT">'+
        '<shadow type="looks_effectmenu"></shadow>'+
      '</value>'+
      '<value name="VALUE">'+
        '<shadow type="math_number">'+
          '<field name="NUM">10</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="looks_cleargraphiceffects"></block>'+
    '<block type="looks_changesizeby">'+
      '<value name="CHANGE">'+
        '<shadow type="math_number">'+
          '<field name="NUM">10</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="looks_setsizeto">'+
      '<value name="SIZE">'+
        '<shadow type="math_number">'+
          '<field name="NUM">100</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="looks_gotofront"></block>'+
    '<block type="looks_gobacklayers">'+
      '<value name="NUM">'+
        '<shadow type="math_integer">'+
          '<field name="NUM">1</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="looks_costumeorder"></block>'+
    '<block type="looks_backdroporder"></block>'+
    '<block type="looks_backdropname"></block>'+
    '<block type="looks_size"></block>'+
  '</category>'+
  '<category name="Sound" colour="#D65CD6" secondaryColour="#BD42BD">'+
    '<block type="sound_play">'+
      '<value name="SOUND_MENU">'+
        '<shadow type="sound_sounds_option"></shadow>'+
      '</value>'+
    '</block>'+
    '<block type="sound_playuntildone">'+
      '<value name="SOUND_MENU">'+
        '<shadow type="sound_sounds_option"></shadow>'+
      '</value>'+
    '</block>'+
    '<block type="sound_stopallsounds"></block>'+
    '<block type="sound_playdrumforbeats">'+
      '<value name="DRUMTYPE">'+
        '<shadow type="math_number">'+
          '<field name="NUM">1</field>'+
        '</shadow>'+
      '</value>'+
      '<value name="BEATS">'+
        '<shadow type="math_number">'+
          '<field name="NUM">0.25</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="sound_restforbeats">'+
      '<value name="BEATS">'+
        '<shadow type="math_number">'+
          '<field name="NUM">0.25</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="sound_playnoteforbeats">'+
      '<value name="NOTE">'+
        '<shadow type="math_number">'+
          '<field name="NUM">1</field>'+
        '</shadow>'+
      '</value>'+
      '<value name="BEATS">'+
        '<shadow type="math_number">'+
          '<field name="NUM">0.5</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="sound_setinstrumentto">'+
      '<value name="INSTRUMENT">'+
        '<shadow type="math_number">'+
          '<field name="NUM">1</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="sound_seteffectto">' +
      '<value name="EFFECT">' +
        '<shadow type="sound_effects_menu"></shadow>' +
      '</value>' +
      '<value name="VALUE">' +
        '<shadow type="math_number">'+
          '<field name="NUM">10</field>'+
        '</shadow>'+
      '</value>' +
    '</block>' +
    '<block type="sound_changeeffectby">' +
      '<value name="EFFECT">' +
        '<shadow type="sound_effects_menu"></shadow>' +
      '</value>' +
      '<value name="VALUE">' +
        '<shadow type="math_number">'+
          '<field name="NUM">10</field>'+
        '</shadow>'+
      '</value>' +
    '</block>' +
    '<block type="sound_cleareffects"></block>' +
    '<block type="sound_changevolumeby">'+
      '<value name="VOLUME">'+
        '<shadow type="math_number">'+
          '<field name="NUM">-10</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="sound_setvolumeto">'+
      '<value name="VOLUME">'+
        '<shadow type="math_number">'+
          '<field name="NUM">100</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="sound_volume"></block>'+
    '<block type="sound_changetempoby">'+
      '<value name="TEMPO">'+
        '<shadow type="math_number">'+
          '<field name="NUM">20</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="sound_settempotobpm">'+
      '<value name="TEMPO">'+
        '<shadow type="math_number">'+
          '<field name="NUM">60</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="sound_tempo"></block>'+
  '</category>'+
  '<category name="Pen" colour="#00B295" secondaryColour="#0B8E69">'+
    '<block type="pen_clear"></block>'+
    '<block type="pen_stamp"></block>'+
    '<block type="pen_pendown"></block>'+
    '<block type="pen_penup"></block>'+
    '<block type="pen_setpencolortocolor">'+
      '<value name="COLOR">'+
        '<shadow type="colour_picker">'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="pen_changepencolorby">'+
      '<value name="COLOR">'+
        '<shadow type="math_number">'+
          '<field name="NUM">10</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="pen_setpencolortonum">'+
      '<value name="COLOR">'+
        '<shadow type="math_number">'+
          '<field name="NUM">0</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="pen_changepenshadeby">'+
      '<value name="SHADE">'+
        '<shadow type="math_number">'+
          '<field name="NUM">10</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="pen_setpenshadeto">'+
      '<value name="SHADE">'+
        '<shadow type="math_number">'+
          '<field name="NUM">50</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="pen_changepensizeby">'+
      '<value name="SIZE">'+
        '<shadow type="math_number">'+
          '<field name="NUM">1</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="pen_setpensizeto">'+
      '<value name="SIZE">'+
        '<shadow type="math_number">'+
          '<field name="NUM">1</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
  '</category>'+
  '<category name="Data" colour="#FF8C1A" secondaryColour="#DB6E00" custom="VARIABLE">'+
  '</category>'+
  '<category name="Lists" colour="#FF8C1A" secondaryColour="#DB6E00">'+
    '<block type="data_listcontents"></block>'+
    '<block type="data_addtolist">'+
      '<value name="ITEM">'+
        '<shadow type="text">'+
          '<field name="TEXT">thing</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="data_deleteoflist">'+
      '<value name="INDEX">'+
        '<shadow type="data_listindexall">'+
          '<field name="INDEX">1</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="data_insertatlist">'+
      '<value name="INDEX">'+
        '<shadow type="data_listindexrandom">'+
          '<field name="INDEX">1</field>'+
        '</shadow>'+
      '</value>'+
      '<value name="ITEM">'+
        '<shadow type="text">'+
          '<field name="TEXT">thing</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="data_replaceitemoflist">'+
      '<value name="INDEX">'+
        '<shadow type="data_listindexrandom">'+
          '<field name="INDEX">1</field>'+
        '</shadow>'+
      '</value>'+
      '<value name="ITEM">'+
        '<shadow type="text">'+
          '<field name="TEXT">thing</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="data_itemoflist">'+
      '<value name="INDEX">'+
        '<shadow type="data_listindexrandom">'+
          '<field name="INDEX">1</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="data_lengthoflist"></block>'+
    '<block type="data_listcontainsitem">'+
      '<value name="ITEM">'+
        '<shadow type="text">'+
          '<field name="TEXT">thing</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="data_showlist"></block>'+
    '<block type="data_hidelist"></block>'+
  '</category>'+
  '<category name="Events" colour="#FFD500" secondaryColour="#CC9900">'+
    '<block type="event_whenflagclicked"></block>'+
    '<block type="event_whenkeypressed">'+
    '</block>'+
    '<block type="event_whenthisspriteclicked"></block>'+
    '<block type="event_whenbackdropswitchesto">'+
    '</block>'+
    '<block type="event_whengreaterthan">'+
      '<value name="VALUE">'+
        '<shadow type="math_number">'+
          '<field name="NUM">10</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="event_whenbroadcastreceived">'+
    '</block>'+
    '<block type="event_broadcast">'+
      '<value name="BROADCAST_OPTION">'+
        '<shadow type="event_broadcast_menu"></shadow>'+
      '</value>'+
    '</block>'+
    '<block type="event_broadcastandwait">'+
      '<value name="BROADCAST_OPTION">'+
        '<shadow type="event_broadcast_menu"></shadow>'+
      '</value>'+
    '</block>'+
  '</category>'+
  '<category name="Control" colour="#FFAB19" secondaryColour="#CF8B17">'+
    '<block type="control_wait">'+
      '<value name="DURATION">'+
        '<shadow type="math_positive_number">'+
          '<field name="NUM">1</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="control_repeat">'+
      '<value name="TIMES">'+
        '<shadow type="math_whole_number">'+
          '<field name="NUM">10</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="control_forever"></block>'+
    '<block type="control_if"></block>'+
    '<block type="control_if_else"></block>'+
    '<block type="control_wait_until"></block>'+
    '<block type="control_repeat_until"></block>'+
    '<block type="control_stop"></block>'+
    '<block type="control_start_as_clone"></block>'+
    '<block type="control_create_clone_of">'+
      '<value name="CLONE_OPTION">'+
        '<shadow type="control_create_clone_of_menu"></shadow>'+
      '</value>'+
    '</block>'+
    '<block type="control_delete_this_clone"></block>'+
  '</category>'+
  '<category name="Sensing" colour="#4CBFE6" secondaryColour="#2E8EB8">'+
    '<block type="sensing_touchingobject">'+
      '<value name="TOUCHINGOBJECTMENU">'+
        '<shadow type="sensing_touchingobjectmenu"></shadow>'+
      '</value>'+
    '</block>'+
    '<block type="sensing_touchingcolor">'+
      '<value name="COLOR">'+
        '<shadow type="colour_picker"></shadow>'+
      '</value>'+
    '</block>'+
    '<block type="sensing_coloristouchingcolor">'+
      '<value name="COLOR">'+
        '<shadow type="colour_picker"></shadow>'+
      '</value>'+
      '<value name="COLOR2">'+
        '<shadow type="colour_picker"></shadow>'+
      '</value>'+
    '</block>'+
    '<block type="sensing_distanceto">'+
      '<value name="DISTANCETOMENU">'+
        '<shadow type="sensing_distancetomenu"></shadow>'+
      '</value>'+
    '</block>'+
    '<block type="sensing_askandwait">'+
      '<value name="QUESTION">'+
        '<shadow type="text">'+
          '<field name="TEXT">What\'s your name?</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
  '<block type="sensing_answer"></block>'+
  '<block type="sensing_keypressed">'+
      '<value name="KEY_OPTION">'+
        '<shadow type="sensing_keyoptions"></shadow>'+
      '</value>'+
  '</block>'+
  '<block type="sensing_mousedown"></block>'+
  '<block type="sensing_mousex"></block>'+
  '<block type="sensing_mousey"></block>'+
  '<block type="sensing_loudness"></block>'+
  '<block type="sensing_videoon">'+
      '<value name="VIDEOONMENU1">'+
        '<shadow type="sensing_videoonmenuone"></shadow>'+
      '</value>'+
      '<value name="VIDEOONMENU2">'+
        '<shadow type="sensing_videoonmenutwo"></shadow>'+
      '</value>'+
  '</block>'+
  '<block type="sensing_videotoggle">'+
      '<value name="VIDEOTOGGLEMENU">'+
        '<shadow type="sensing_videotogglemenu"></shadow>'+
      '</value>'+
  '</block>'+
  '<block type="sensing_setvideotransparency">'+
    '<value name="TRANSPARENCY">'+
      '<shadow type="math_number">'+
        '<field name="NUM">50</field>'+
      '</shadow>'+
    '</value>'+
  '</block>'+
  '<block type="sensing_timer"></block>'+
  '<block type="sensing_resettimer"></block>'+
  '<block type="sensing_of">'+
    '<value name="PROPERTY">'+
      '<shadow type="sensing_of_property_menu"></shadow>'+
    '</value>'+
    '<value name="OBJECT">'+
      '<shadow type="sensing_of_object_menu"></shadow>'+
    '</value>'+
  '</block>'+
  '<block type="sensing_current">'+
    '<value name="CURRENTMENU">'+
      '<shadow type="sensing_currentmenu"></shadow>'+
    '</value>'+
  '</block>'+
  '<block type="sensing_dayssince2000"></block>'+
  '<block type="sensing_username"></block>'+
  '</category>'+
  '<category name="Operators" colour="#40BF4A" secondaryColour="#389438">'+
    '<block type="operator_add">'+
      '<value name="NUM1">'+
        '<shadow type="math_number">'+
          '<field name="NUM"></field>'+
        '</shadow>'+
      '</value>'+
      '<value name="NUM2">'+
        '<shadow type="math_number">'+
          '<field name="NUM"></field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="operator_subtract">'+
      '<value name="NUM1">'+
        '<shadow type="math_number">'+
          '<field name="NUM"></field>'+
        '</shadow>'+
      '</value>'+
      '<value name="NUM2">'+
        '<shadow type="math_number">'+
          '<field name="NUM"></field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="operator_multiply">'+
      '<value name="NUM1">'+
        '<shadow type="math_number">'+
          '<field name="NUM"></field>'+
        '</shadow>'+
      '</value>'+
      '<value name="NUM2">'+
        '<shadow type="math_number">'+
          '<field name="NUM"></field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="operator_divide">'+
      '<value name="NUM1">'+
        '<shadow type="math_number">'+
          '<field name="NUM"></field>'+
        '</shadow>'+
      '</value>'+
      '<value name="NUM2">'+
        '<shadow type="math_number">'+
          '<field name="NUM"></field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="operator_random">'+
      '<value name="FROM">'+
        '<shadow type="math_number">'+
          '<field name="NUM">1</field>'+
        '</shadow>'+
      '</value>'+
      '<value name="TO">'+
        '<shadow type="math_number">'+
          '<field name="NUM">10</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="operator_lt">'+
      '<value name="OPERAND1">'+
        '<shadow type="text">'+
          '<field name="TEXT"></field>'+
        '</shadow>'+
      '</value>'+
      '<value name="OPERAND2">'+
        '<shadow type="text">'+
          '<field name="TEXT"></field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="operator_equals">'+
      '<value name="OPERAND1">'+
        '<shadow type="text">'+
          '<field name="TEXT"></field>'+
        '</shadow>'+
      '</value>'+
      '<value name="OPERAND2">'+
        '<shadow type="text">'+
          '<field name="TEXT"></field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="operator_gt">'+
      '<value name="OPERAND1">'+
        '<shadow type="text">'+
          '<field name="TEXT"></field>'+
        '</shadow>'+
      '</value>'+
      '<value name="OPERAND2">'+
        '<shadow type="text">'+
          '<field name="TEXT"></field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="operator_and"></block>'+
    '<block type="operator_or"></block>'+
    '<block type="operator_not"></block>'+
    '<block type="operator_join">'+
      '<value name="STRING1">'+
        '<shadow type="text">'+
          '<field name="TEXT">hello</field>'+
        '</shadow>'+
      '</value>'+
      '<value name="STRING2">'+
        '<shadow type="text">'+
          '<field name="TEXT">world</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="operator_letter_of">'+
      '<value name="LETTER">'+
        '<shadow type="math_whole_number">'+
          '<field name="NUM">1</field>'+
        '</shadow>'+
      '</value>'+
      '<value name="STRING">'+
        '<shadow type="text">'+
          '<field name="TEXT">world</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="operator_length">'+
      '<value name="STRING">'+
        '<shadow type="text">'+
          '<field name="TEXT">world</field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="operator_mod">'+
      '<value name="NUM1">'+
        '<shadow type="math_number">'+
          '<field name="NUM"></field>'+
        '</shadow>'+
      '</value>'+
      '<value name="NUM2">'+
        '<shadow type="math_number">'+
          '<field name="NUM"></field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="operator_round">'+
      '<value name="NUM">'+
        '<shadow type="math_number">'+
          '<field name="NUM"></field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
    '<block type="operator_mathop">'+
      '<value name="OPERATOR">'+
        '<shadow type="operator_mathop_menu"></shadow>'+
      '</value>'+
      '<value name="NUM">'+
        '<shadow type="math_number">'+
          '<field name="NUM"></field>'+
        '</shadow>'+
      '</value>'+
    '</block>'+
  '</category>'+
  '<category name="More Blocks" colour="#FF6680" secondaryColour="#FF3355" custom="PROCEDURE"></category>'+
  '</xml>';
