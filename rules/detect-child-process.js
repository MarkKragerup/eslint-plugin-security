/**
 * Tries to detect instances of child_process
 * @author Adam Baldwin
 */

'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const names = [];

export default {
  meta: {
    type: 'error',
    docs: {
      description: 'Detect instances of "child_process" & non-literal "exec()" calls.',
      category: 'Possible Security Vulnerability',
      recommended: true,
      url: 'https://github.com/nodesecurity/eslint-plugin-security/blob/main/docs/avoid-command-injection-node.md',
    },
  },
  create: function (context) {
    return {
      CallExpression: function (node) {
        if (node.callee.name === 'require') {
          const args = node.arguments[0];
          if (args && args.type === 'Literal' && args.value === 'child_process') {
            if (node.parent.type === 'VariableDeclarator') {
              names.push(node.parent.id.name);
            } else if (node.parent.type === 'AssignmentExpression' && node.parent.operator === '=') {
              names.push(node.parent.left.name);
            }
            return context.report(node, 'Found require("child_process")');
          }
        }
      },
      MemberExpression: function (node) {
        if (node.property.name === 'exec' && names.indexOf(node.object.name) > -1) {
          if (node.parent && node.parent.arguments && node.parent.arguments[0].type !== 'Literal') {
            return context.report(node, 'Found child_process.exec() with non Literal first argument');
          }
        }
      },
    };
  },
};
