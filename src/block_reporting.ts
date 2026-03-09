import * as Blockly from 'blockly/core'
import { Colours } from './colours'

export function reportValue(id: string, value: string) {
  const block = (Blockly.getMainWorkspace().getBlockById(id) ||
    (Blockly.getMainWorkspace() as Blockly.WorkspaceSvg)
      .getFlyout()
      ?.getWorkspace()
      ?.getBlockById(id)) as Blockly.BlockSvg
  if (!block) {
    throw new Error('Tried to report value on block that does not exist.')
  }

  let field
  for (const input of block.inputList) {
    for (const f of input.fieldRow) {
      field = f
      break
    }
  }
  if (!field) return

  const contentDiv = Blockly.DropDownDiv.getContentDiv()
  const valueReportBox = document.createElement('div')
  valueReportBox.setAttribute('class', 'valueReportBox')
  valueReportBox.innerText = value
  contentDiv.appendChild(valueReportBox)
  Blockly.DropDownDiv.setColour(Colours.valueReportBackground, Colours.valueReportBorder)
  Blockly.DropDownDiv.showPositionedByBlock(field, block)
}
