import * as Blockly from 'blockly/core';
import {Colours} from '../core/colours.js';

export function reportValue(id, value) {
  const block = Blockly.getMainWorkspace().getBlockById(id) ||
      Blockly.getMainWorkspace().getFlyout().getWorkspace().getBlockById(id);
  if (!block) {
    throw 'Tried to report value on block that does not exist.';
  }

  let field;
  for (const input of block.inputList) {
    for (const f of input.fieldRow) {
      field = f;
      break;
    }
  }
  if (!field) return;

  const contentDiv = Blockly.DropDownDiv.getContentDiv();
  const valueReportBox = document.createElement('div');
  valueReportBox.setAttribute('class', 'valueReportBox');
  valueReportBox.innerText = value;
  contentDiv.appendChild(valueReportBox);
  Blockly.DropDownDiv.setColour(
      Colours.valueReportBackground,
      Colours.valueReportBorder
  );
  Blockly.DropDownDiv.showPositionedByBlock(field, block);
}
