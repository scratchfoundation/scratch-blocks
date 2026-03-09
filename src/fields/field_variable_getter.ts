/**
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
 * https://developers.google.com/blockly/
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
/**
 * @file Variable getter field.  Appears as a label but has a variable
 *     picker in the right-click menu.
 * @author fenichel@google.com (Rachel Fenichel)
 */
import * as Blockly from 'blockly/core'

/**
 * Class for a variable getter field.
 */
class FieldVariableGetter extends Blockly.FieldLabel {
  private variable: Blockly.IVariableModel<Blockly.IVariableState> | null = null

  /**
   * Creates a new FieldVariableGetter.
   * @param allowedVariableType The type of variables this field can display.
   */
  constructor(private allowedVariableType = '') {
    super(Blockly.Field.SKIP_SETUP)
    this.SERIALIZABLE = true
  }

  /**
   * Returns the ID of this field's variable.
   * @returns The ID of this field's variable.
   */
  getValue(): string {
    return this.variable?.getId() ?? ''
  }

  /**
   * Returns the name of this field's variable.
   * @returns The name of this field's variable.
   */
  getText(): string {
    return this.variable?.getName() ?? ''
  }

  /**
   * Get the variable model for the variable associated with this field.
   * Not guaranteed to be in the variable map on the workspace (e.g. if accessed
   * after the variable has been deleted).
   * @returns the selected variable, or null if none was selected.
   */
  getVariable(): Blockly.IVariableModel<Blockly.IVariableState> | null {
    return this.variable
  }

  /**
   * Updates this field's variable to one with the given ID.
   * @param newVariableId ID of a variable this field should represent.
   */
  doValueUpdate_(newVariableId: string) {
    super.doValueUpdate_(newVariableId)
    const workspace = this.getSourceBlock()!.workspace
    this.variable = Blockly.Variables.getVariable(workspace, newVariableId)
  }

  /**
   * Informs Blockly that this field depends on a variable.
   * @returns Always true.
   */
  referencesVariables() {
    return true
  }

  /** Rerenders this field when the underlying variable's name changes. */
  refreshVariableName() {
    this.forceRerender()
  }

  static fromJson(options: FieldVariableGetterConfig) {
    return new FieldVariableGetter(options.allowedVariableType)
  }

  fromXml(element: Element) {
    this.setValue(element.getAttribute('id')!)
  }

  toXml(element: Element): Element {
    element.setAttribute('id', this.variable!.getId())
    element.setAttribute('variabletype', this.variable!.getType())
    element.textContent = this.variable!.getName()
    return element
  }
}

interface FieldVariableGetterConfig extends Blockly.FieldLabelConfig {
  allowedVariableType?: string
}

/**
 * Register the field and any dependencies.
 */
export function registerFieldVariableGetter() {
  Blockly.fieldRegistry.register('field_variable_getter', FieldVariableGetter)
}
