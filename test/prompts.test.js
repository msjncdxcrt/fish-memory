import test from 'node:test';
import assert from 'node:assert/strict';
import { TASK_CONTEXT, TASK_CONTEXT_VARIANTS, TASK_CONTEXT_OPTIONS, DEFAULT_TASK_CONTEXT, applyTaskContext, setTaskContext, taskContextText } from '../src/agents/prompts.js';
import { INITIALIZE } from '../src/agents/prompts.js';

test('builtin frame keeps the shipped archivist text untouched', () => {
    setTaskContext('builtin');
    assert.equal(TASK_CONTEXT_VARIANTS.builtin, TASK_CONTEXT);
    assert.equal(applyTaskContext(TASK_CONTEXT), TASK_CONTEXT);
    assert.equal(applyTaskContext(INITIALIZE), INITIALIZE);
});

test('every alternative swaps only the opening section', () => {
    const tail = INITIALIZE.slice(TASK_CONTEXT.length);
    for (const [key] of TASK_CONTEXT_OPTIONS) {
        if (key === 'builtin') continue;
        setTaskContext(key);
        assert.equal(applyTaskContext(INITIALIZE), TASK_CONTEXT_VARIANTS[key] + tail);
        assert.equal(applyTaskContext(TASK_CONTEXT), TASK_CONTEXT_VARIANTS[key]);
    }
    setTaskContext('builtin');
});

test('a custom opening wins over the selected frame and can be cleared', () => {
    const tail = INITIALIZE.slice(TASK_CONTEXT.length).replace(/^\s+/, '');
    setTaskContext('fact', '自定义开场白');
    assert.equal(applyTaskContext(INITIALIZE), `自定义开场白\n\n${tail}`);
    assert.equal(applyTaskContext('自定义预设条目原文'), '自定义预设条目原文');
    assert.equal(taskContextText(), '自定义开场白');
    setTaskContext('builtin', '');
    assert.equal(applyTaskContext(INITIALIZE), INITIALIZE);
    assert.equal(taskContextText(), TASK_CONTEXT);
});

test('the shipped default frame is the strongest built-in variant', () => {
    assert.equal(DEFAULT_TASK_CONTEXT, 'overdrive');
    assert.equal(TASK_CONTEXT_OPTIONS[0][0], 'overdrive');
    assert.equal(TASK_CONTEXT_OPTIONS.at(-1)[0], 'builtin');
    assert.equal(TASK_CONTEXT_OPTIONS.length, 8);
    setTaskContext('nope', '');
    assert.equal(applyTaskContext(INITIALIZE), TASK_CONTEXT_VARIANTS.overdrive + INITIALIZE.slice(TASK_CONTEXT.length));
    setTaskContext('overdrive', '');
});

test('foreign text is passed through and unknown keys fall back', () => {
    setTaskContext('fact');
    assert.equal(applyTaskContext('自定义预设条目原文'), '自定义预设条目原文');
    assert.equal(applyTaskContext(undefined), '');
    setTaskContext('nope');
    assert.equal(applyTaskContext(TASK_CONTEXT), TASK_CONTEXT_VARIANTS.overdrive);
    setTaskContext('fact');
});
