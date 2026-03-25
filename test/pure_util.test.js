import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml, html_game_list } from '../src/pure_util.js';

test('escapeHtml escapes special characters', () => {
  assert.strictEqual(escapeHtml('<b>"test" & \'item\'</b>'), '&lt;b&gt;&quot;test&quot; &amp; &#039;item&#039;&lt;/b&gt;');
});

test('escapeHtml handles empty string', () => {
  assert.strictEqual(escapeHtml(''), '');
});

test('escapeHtml handles string with no special characters', () => {
  assert.strictEqual(escapeHtml('plain text'), 'plain text');
});

test('escapeHtml handles only special characters', () => {
  assert.strictEqual(escapeHtml('&<>"\''), '&amp;&lt;&gt;&quot;&#039;');
});

test('html_game_list handles empty array', () => {
  assert.strictEqual(html_game_list([]), '');
});

test('html_game_list formats single game', () => {
  const games = [{ url: 'http://example.com', title: 'Game 1', status: 'claimed' }];
  assert.strictEqual(html_game_list(games), '- <a href="http://example.com">Game 1</a> (claimed)');
});

test('html_game_list formats multiple games', () => {
  const games = [
    { url: 'http://example1.com', title: 'Game 1', status: 'claimed' },
    { url: 'http://example2.com', title: 'Game 2', status: 'available' },
  ];
  assert.strictEqual(html_game_list(games), '- <a href="http://example1.com">Game 1</a> (claimed)<br>- <a href="http://example2.com">Game 2</a> (available)');
});

test('html_game_list escapes game titles', () => {
  const games = [{ url: 'http://example.com', title: '<b>Game & Watch</b>', status: 'claimed' }];
  assert.strictEqual(html_game_list(games), '- <a href="http://example.com">&lt;b&gt;Game &amp; Watch&lt;/b&gt;</a> (claimed)');
});

test('html_game_list handles special characters in status and url', () => {
  const games = [{ url: 'http://example.com?a=1&b=2', title: 'Game', status: 'claimed & ready' }];
  // Note: url is not escaped in current implementation, but title is.
  assert.strictEqual(html_game_list(games), '- <a href="http://example.com?a=1&b=2">Game</a> (claimed & ready)');
});
