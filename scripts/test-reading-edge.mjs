import test from 'node:test';
import assert from 'node:assert/strict';
import reading from '../netlify/edge-functions/reading.js';
import { forwardText } from '../lib/anthropic-text-stream.mjs';

function sse(text, complete = true) {
  const events = [{type:'content_block_delta',delta:{type:'text_delta',text}},
    {type:'message_delta',delta:{stop_reason:'end_turn'}}, ...(complete ? [{type:'message_stop'}] : [])];
  const bytes = new TextEncoder().encode(events.map(e=>'data: '+JSON.stringify(e)+'\r\n\r\n').join(''));
  let i=0;
  return new ReadableStream({pull(c){if(i<bytes.length)c.enqueue(bytes.slice(i,++i));else c.close();}});
}

test('provider SSE handles UTF-8 split at every byte', async()=>{
  let text=''; await forwardText(sse('中文正文'),t=>{text+=t;}); assert.equal(text,'中文正文');
});
test('truncated provider streams cannot pass as completed readings', async()=>{
  await assert.rejects(forwardText(sse('部分正文',false),()=>{}),/before completion/);
});
test('empty provider output cannot pass as a completed reading', async()=>{
  await assert.rejects(forwardText(sse(''),()=>{}),/no interpretation/);
});
test('edge returns charts immediately while provider is still waiting', async()=>{
  const originalFetch=globalThis.fetch;
  globalThis.Netlify={env:{get:k=>k==='ANTHROPIC_API_KEY'?'test-only-key':undefined}};
  let release;
  const waiting=new Promise(resolve=>{release=resolve;});
  globalThis.fetch=async(url,options)=>{
    if(String(url).includes('/api/chart-data')) return Response.json({charts:{mode:'single'},lang:'zh-CN'});
    const input=JSON.parse(options.body);
    assert.equal(input.model,'claude-sonnet-5-5');
    assert.equal(input.max_tokens,4000);
    assert.equal(options.headers['x-api-key'],'test-only-key');
    await waiting;
    return new Response(sse('完整解读正文'));
  };
  try {
    const result=await reading(new Request('https://example.test/api/reading',{method:'POST',body:'{}'}));
    assert.equal(result.headers.get('x-reading-runtime'),'edge-v1');
    const reader=result.body.getReader();
    const first=await reader.read();
    assert.match(new TextDecoder().decode(first.value),/"charts"/);
    release();
    let text=''; while(true){const chunk=await reader.read();if(chunk.done)break;text+=new TextDecoder().decode(chunk.value);}
    assert.equal(text,'完整解读正文');
  } finally {globalThis.fetch=originalFetch;delete globalThis.Netlify;release();}
});
