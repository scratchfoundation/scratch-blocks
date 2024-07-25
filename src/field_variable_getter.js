/**
 * @license
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
 * @fileoverview Variable getter field.  Appears as a label but has a variable
 *     picker in the right-click menu.
 * @author fenichel@google.com (Rachel Fenichel)
 */
import * as Blockly from "blockly/core";

/**
 * Class for a variable getter field.
 * @param {string} allowedVariableType The type of variables this field can display.
 */
export class FieldVariableGetter extends Blockly.FieldLabel {
  constructor(allowedVariableType = "") {
    super(Blockly.Field.SKIP_SETUP);
    this.SERIALIZABLE = true;
    this.allowedVariableType = allowedVariableType;
    this.variable = null;
  }

  /**
   * Returns the ID of this field's variable.
   * @return {string} The ID of this field's variable.
   */
  getValue() {
    return this.variable?.getId() ?? "";
  }

  /**
   * Returns the name of this field's variable.
   * @return {string} The name of this field's variable.
   */
  getText() {
    return this.variable?.getName() ?? "";
  }

  /**
   * Get the variable model for the variable associated with this field.
   * Not guaranteed to be in the variable map on the workspace (e.g. if accessed
   * after the variable has been deleted).
   * @return {?Blockly.VariableModel} the selected variable, or null if none was
   *     selected.
   * @package
   */
  getVariable() {
    return this.variable;
  }

  /**
   * Updates this field's variable to one with the given ID.
   * @param {string} newVariableId ID of a variable this field should represent.
   */
  doValueUpdate_(newVariableId) {
    super.doValueUpdate_(newVariableId);
    const workspace = this.getSourceBlock().workspace;
    this.variable = Blockly.Variables.getVariable(workspace, newVariableId);
  }

  /** Informs Blockly that this field depends on a variable. */
  referencesVariables() {
    return true;
  }

  /** Rerenders this field when the underlying variable's name changes. */
  refreshVariableName() {
    this.forceRerender();
  }

  static fromJson(options) {
    return new FieldVariableGetter(options["allowedVariableType"]);
  }

  fromXml(element) {
    this.setValue(element.getAttribute("id"));
  }

  toXml(element) {
    element.setAttribute("id", this.variable.getId());
    element.setAttribute("variabletype", this.variable.getType());
    element.textContent = this.variable.getName();
    return element;
  }
}

Blockly.fieldRegistry.register("field_variable_getter", FieldVariableGetter);
