import * as Blockly from 'blockly/core';
import {ContinuousToolbox} from '@blockly/continuous-toolbox';

export class ScratchContinuousToolbox extends ContinuousToolbox {
  refreshSelection() {
    // Intentionally a no-op, Scratch manually manages refreshing the toolbox via forceRerender().
  }

  forceRerender() {
    super.refreshSelection();
  }
}
