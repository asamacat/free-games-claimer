import assert from 'node:assert/strict';
import { escapeHtml, html_game_list } from '../src/pure_util.js';

// Test escapeHtml
console.log('Testing escapeHtml...');

assert.strictEqual(escapeHtml(''), '', 'Empty string');
assert.strictEqual(escapeHtml('Hello World'), 'Hello World', 'No special characters');
assert.strictEqual(escapeHtml('&'), '&amp;', 'Escape &');
assert.strictEqual(escapeHtml('<'), '&lt;', 'Escape <');
assert.strictEqual(escapeHtml('>'), '&gt;', 'Escape >');
assert.strictEqual(escapeHtml('"'), '&quot;', 'Escape "');
assert.strictEqual(escapeHtml("'"), '&#039;', "Escape '");
assert.strictEqual(
  escapeHtml('<script>alert("xss & more");</script>'),
  '&lt;script&gt;alert(&quot;xss &amp; more&quot;);&lt;/script&gt;',
  'Complex string'
);
assert.strictEqual(escapeHtml('A & B < C > D " E \' F'), 'A &amp; B &lt; C &gt; D &quot; E &#039; F', 'Multiple different characters');

console.log('escapeHtml tests passed!');

// Test html_game_list
console.log('Testing html_game_list...');

const games = [
  { title: 'Game 1', url: 'https://example.com/1', status: 'claimed' },
  { title: 'Game <2>', url: 'https://example.com/2', status: 'available' },
];

const expectedHtml = '- <a href="https://example.com/1">Game 1</a> (claimed)<br>- <a href="https://example.com/2">Game &lt;2&gt;</a> (available)';
assert.strictEqual(html_game_list(games), expectedHtml, 'html_game_list formatting and escaping');

assert.strictEqual(html_game_list([]), '', 'Empty game list');

console.log('html_game_list tests passed!');
console.log('All tests in test/util.js passed!');
