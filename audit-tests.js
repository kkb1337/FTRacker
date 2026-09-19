/* FTracker Dynamic Index invariant tests; run with: node audit-tests.js */
const assert=require('node:assert/strict');
const clamp=(v,min=0,max=100)=>{v=Number(v);if(!Number.isFinite(v))return null;min=Number.isFinite(Number(min))?Number(min):0;max=Number.isFinite(Number(max))?Number(max):100;if(min>max)[min,max]=[max,min];return Math.max(min,Math.min(max,v));};
const frequency=(count,periodDays=90)=>{count=Math.max(0,Number(count)||0);periodDays=Math.max(1,Number(periodDays)||90);const ideal=15*periodDays/90;if(ideal<=0)return 0;const ratio=count/ideal;if(ratio>=.9&&ratio<=1.15)return 100;if(ratio>1.15)return clamp(100-(ratio-1.15)*35);return clamp(ratio*100);};
for(const n of [0,1,7,15,30,100])assert.ok(frequency(n)>=0&&frequency(n)<=100);
assert.equal(clamp(NaN),null);assert.equal(clamp(Infinity),null);assert.equal(clamp(120),100);
console.log('FTracker scoring invariants: OK');
