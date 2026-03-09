/**
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
/**
 * @file Text input field with floating "remove" button.
 * @author pkaplan@media.mit.edu (Paul Kaplan)
 */
import * as Blockly from 'blockly/core'
import type { ProcedureDeclarationBlock } from '../blocks/procedures'

/**
 * Class for an editable text field displaying a deletion icon when selected.
 */
export class FieldTextInputRemovable extends Blockly.FieldTextInput {
  private removeButtonMouseWrapper_?: Blockly.browserEvents.Data

  /**
   * Show the inline free-text editor on top of the text with the remove button.
   */
  showEditor_() {
    // Wait for our parent block to render so we can examine its metrics to
    // calculate rounded corners on the editor as needed.
    Blockly.renderManagement.finishQueuedRenders().then(() => {
      super.showEditor_()

      const div = Blockly.WidgetDiv.getDiv()!
      div.className += ' removableTextInput'
      const removeButton = document.createElement('img')
      removeButton.className = 'blocklyTextRemoveIcon'
      removeButton.setAttribute('src', this.sourceBlock_!.workspace.options.pathToMedia + 'icons/remove.svg')
      this.removeButtonMouseWrapper_ = Blockly.browserEvents.bind(
        removeButton,
        'mousedown',
        this,
        this.removeCallback_,
      )
      div.appendChild(removeButton)
    })
  }

  /**
   * Function to call when remove button is called. Checks for removeFieldCallback
   * on sourceBlock and calls it if possible.
   */
  private removeCallback_() {
    if (this.sourceBlock_ && 'removeFieldCallback' in this.sourceBlock_) {
      ;(this.sourceBlock_ as ProcedureDeclarationBlock).removeFieldCallback(this)
    } else {
      console.warn('Expected a source block with removeFieldCallback')
    }
  }

  /**
   * Helper function to construct a FieldTextInputRemovable from a JSON arg object,
   * dereferencing any string table references.
   * @param options A JSON object with options (text, class, and spellcheck).
   * @returns The new text input.
   */
  fromJson(options: Blockly.FieldTextInputFromJsonConfig): FieldTextInputRemovable {
    const text = Blockly.utils.parsing.replaceMessageReferences(options.text)
    const field = new FieldTextInputRemovable(text, null, options)
    if (typeof options.spellcheck == 'boolean') {
      field.setSpellcheck(options.spellcheck)
    }
    return field
  }
}

/**
 * Register the field and any dependencies.
 */
export function registerFieldTextInputRemovable() {
  Blockly.fieldRegistry.register('field_input_removable', FieldTextInputRemovable)
}
