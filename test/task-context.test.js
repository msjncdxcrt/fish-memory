import test from 'node:test';
import assert from 'node:assert/strict';
import { TASK_CONTEXT, TASK_CONTEXT_VARIANTS, TASK_CONTEXT_OPTIONS, applyTaskContext, setTaskContext } from '../src/agents/prompts.js';
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

test('foreign text is passed through and unknown keys fall back', () => {
    setTaskContext('fact');
    assert.equal(applyTaskContext('自定义预设条目原文'), '自定义预设条目原文');
    assert.equal(applyTaskContext(undefined), '');
    setTaskContext('nope');
    assert.equal(applyTaskContext(TASK_CONTEXT), TASK_CONTEXT);
});
