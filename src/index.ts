import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { INotebookTracker } from '@jupyterlab/notebook';
import { CodeMirrorEditor, ICodeMirror } from '@jupyterlab/codemirror';

import * as _ from 'underscore';

class SqlCodeMirror {
  constructor(
    protected app: JupyterFrontEnd,
    protected tracker: INotebookTracker,
    protected code_mirror: ICodeMirror
  ) {
    this.tracker?.activeCellChanged?.connect(() => {
      if (this.tracker?.activeCell !== null) {
        const cell = this.tracker.activeCell;
        if (cell !== null && cell?.model.type === 'code') {
          const code_mirror_editor = cell?.editor as CodeMirrorEditor;
          const debounced_on_change = _.debounce(() => {
            // check for editor with first line starting with %%sql
            const line = code_mirror_editor
              .getLine(code_mirror_editor.firstLine())
              ?.trim();
            if (line?.startsWith('%sql') || line?.startsWith('%%sql')) {
              code_mirror_editor.editor.setOption('mode', 'text/x-sql');
            } else {
              code_mirror_editor.editor.setOption('mode', 'text/x-ipython');
            }
          }, 300);
          code_mirror_editor.editor.on('change', debounced_on_change);
          debounced_on_change();
        }
      }
    });
  }
}

function activate(
  app: JupyterFrontEnd,
  tracker: INotebookTracker,
  code_mirror: ICodeMirror
): void {
  new SqlCodeMirror(app, tracker, code_mirror);
  console.log('SQLCodeMirror loaded.');
}

/**
 * Initialization data for the jupyterlabs_sql_codemirror extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: '@composable/jupyterlabs-sql-codemirror',
  autoStart: true,
  requires: [INotebookTracker, ICodeMirror],
  optional: [],
  activate: activate
};

export default extension;
