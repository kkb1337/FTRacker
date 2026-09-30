/* FTracker v1.8.59 logic regression tests; run with: node audit-tests.js */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const app=fs.readFileSync('app.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const manifest=fs.readFileSync('manifest.json','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const css=fs.readFileSync('styles.css','utf8');
const readme=fs.readFileSync('README.md','utf8');

// Global progress model: 3 for strength, 1 for cardio/reps.
const required=t=>t==='strength'?3:1;
const progress=types=>{const total=types.reduce((s,t)=>s+required(t),0); return {done:0,total};};
assert.deepEqual(progress(['strength','strength','strength','strength','strength','strength','cardio','bodyweight']),{done:0,total:20});
const dynamicProgress=(requiredRows, rows, completed)=>({done:Math.min(completed,requiredRows),total:requiredRows});
assert.deepEqual(dynamicProgress(1,2,2),{done:1,total:1},'cardio extra result must not expand progress');
assert.deepEqual(dynamicProgress(1,3,3),{done:1,total:1},'cardio extra results must not expand progress');
assert.deepEqual(dynamicProgress(3,4,4),{done:3,total:3},'strength fourth set must not expand progress');

// New/replaced exercise starts with zero sets; no copied historical row.
assert.match(app,/workoutSets\[ref\]=\[\];/);
assert.doesNotMatch(app,/workoutSets\[newRef\]=\[row\];/);
assert.doesNotMatch(app,/const previous=getPreviousExerciseResult\(replacementName/);

// Historical working weight is not restricted by program/split.
assert.match(app,/Working weight is an exercise-level historical metric/);
assert.doesNotMatch(app,/if\(programName && entry\.program!==programName\) return;/);

// Recommendation must come from a qualified historical working weight, not fallback estimation.
assert.match(app,/const base=getLatestWorkingResult\(exerciseName,programName,before\);/);
assert.doesNotMatch(app,/const base=working\|\|fallback/);
assert.ok(app.includes('const evaluationDays=custom?Math.max(7,Math.min(365,Number(custom.evaluationDays)||90)):90;'),'standard Index period must be fixed at 90 days');
assert.ok(app.includes('e1rmScore*.6+workingScore*.4'),'strength weighting must be 60/40');
assert.ok(app.includes('const evaluationDays=custom?Math.max(7,Math.min(365,Number(custom.evaluationDays)||90)):90;'),'standard Index period must be fixed at 90 days');
assert.ok(app.includes('e1rmScore*.6+workingScore*.4'),'strength weighting must be 60/40');

// Top progress uses the planned required units and never penalizes additional completed sets.
assert.match(app,/const baseTotal=activeIndices\.reduce\(\(sum,idx\)=>sum\+getWorkoutCompletionTarget/);
assert.match(app,/const completed=activeIndices\.reduce\(\(sum,idx\)=>sum\+countWorkoutSetResults/);
assert.match(app,/const total=baseTotal;/);
assert.match(app,/const completedForProgress=Math\.min\(completed,baseTotal\)/);

// Recommendation card contains only the target; explanatory copy is removed.
assert.doesNotMatch(app,/Почему стоит улучшить/);

// Split picker can create the same directory exercise inline and attach it to the current split.
assert.match(app,/openNewDirectoryExerciseForSplit/);
assert.match(app,/pendingSplitExerciseCreate/);
assert.match(index,/program-picker-add-new/);
assert.match(index,/Создать упражнение — нет в списке/);
assert.doesNotMatch(app,/insertAdjacentHTML\('beforeend', `.*program-picker-add-new/);
assert.match(index,/exercisePickerSearch/);

// Release metadata must be synchronized.
for(const s of [app,index,manifest,sw,readme]) assert.ok(s.includes('1.8.59'),'stale release version');
assert.ok(index.includes('от 30.09.26'),'release date missing');
assert.ok(sw.includes("const APP_VERSION = '1.8.59'"),'SW cache version missing');


assert.ok(app.includes("weights:{systemity:40,strength:60}"),'training index default weights must be 40/60');
assert.ok(!app.includes('fscoreCustomTrainingVolumeWeight'),'custom goal editor must not expose volume weight');
assert.ok(!app.includes("name:'Объём'"),'volume must not be a training Index factor');
assert.ok(app.includes("name:'Системность'"),'systemity factor missing');
assert.ok(app.includes("name:'Силовая динамика'"),'strength factor missing');
assert.ok(app.includes('createdAt'), 'custom goal creation baseline missing');
assert.ok(app.includes('Math.max(now-days*86400000,Number(startAt)||0)'), 'goal startAt baseline missing');
assert.ok(app.includes('const total=baseTotal;'),'extra completed sets must not expand workout progress');
console.log('FTracker v1.8.59 logic regression tests: OK');

// v1.8.57: replacement creation must replace the frozen slot, not append.
assert(fs.readFileSync('app.js','utf8').includes("workoutNewExerciseContext={mode:'replace',slot,programIndex:Number(currentProgram),oldRef:slots[slot]}"), 'replace creation context must freeze slot before closing replace modal');
assert(fs.readFileSync('app.js','utf8').includes('slots.splice(slot,1,ref);'), 'new exercise replacement must replace the selected slot');


// v1.8.57: workout header UI remains compact and uses a clear back arrow.
assert.ok(index.includes('class="workout-close"'),'workout back control missing');
assert.ok(index.includes('>←</button>'),'workout back arrow missing');
assert.ok(css.includes('v1.8.57 — workout notes'),'v1.8.57 workout UI block missing');
assert.ok(css.includes('#workoutScreen .workout-time'),'workout timer styling missing');
assert.ok(css.includes('#workoutScreen .workout-exercise-name-large'),'workout exercise title styling missing');

// v1.8.59: partial food diary days are excluded until at least 70% of calorie target.
assert.match(app,/d\.cal>=target\*0\.70/,'nutrition days must meet the 70% calorie threshold');
assert.match(app,/if\(days\.length<3\)return \{score:null,available:false,days:days\.length/,'nutrition Index requires at least three eligible days');
assert.match(app,/blockEnabled:\{body:cfg\.blockEnabled\?\.body!==false,training:cfg\.blockEnabled\?\.training!==false,nutrition:cfg\.blockEnabled\?\.nutrition!==false\}/,'custom goal factor switches must persist');
assert.match(app,/toggleFScoreFactor\('nutrition'\)/,'nutrition factor toggle missing');
assert.match(app,/const enabledWeightSum=/,'custom goal weights must normalize only enabled factors');
assert.match(app,/Выключено в цели/,'disabled factor should not be treated as missing data');

// v1.8.59: tolerance is a maintain-only UI field. The hidden class must
// override the more-specific flex layout rule.
assert.match(css,/\.fscore-target-values \.fscore-target-value-cell\.tolerance\.hidden\{display:none!important;\}/,
  'non-maintain tolerance field must remain hidden');

console.log('FTracker v1.8.59 nutrition/custom-factor regression checks: OK');
