// AURUM X Hero Component
export function AurumHero({decision,confidence,entry,stop,target,waveScore}:any){
return (
<section className="rounded-3xl border border-yellow-700 bg-[#11110d] p-8">
<div className="flex justify-between items-center">
<div>
<div className="text-xs tracking-[0.35em] text-yellow-500">PRIVATE GOLD INTELLIGENCE PLATFORM</div>
<h1 className="text-6xl font-black text-white mt-2">AURUM AI</h1>
<p className="text-zinc-400">Institutional Command Center</p>
</div>
<div className="text-right">
<div className="text-sm text-zinc-400">WAVE SCORE</div>
<div className="text-5xl font-bold text-yellow-400">{waveScore}</div>
</div>
</div>
<div className="grid grid-cols-2 gap-6 mt-8">
<div className="rounded-2xl border border-yellow-700 p-6">
<div className="text-zinc-400">AI DECISION</div>
<div className="text-7xl font-black text-yellow-400 mt-2">{decision}</div>
<div className="grid grid-cols-3 gap-4 mt-8">
<div><div className="text-xs text-zinc-500">ENTRY</div><div className="text-2xl text-white">{entry}</div></div>
<div><div className="text-xs text-zinc-500">STOP</div><div className="text-2xl text-white">{stop}</div></div>
<div><div className="text-xs text-zinc-500">TARGET</div><div className="text-2xl text-white">{target}</div></div>
</div>
</div>
<div className="rounded-2xl border border-yellow-700 flex items-center justify-center">
<div className="h-56 w-56 rounded-full border-8 border-yellow-500 flex items-center justify-center">
<div className="text-center">
<div className="text-6xl font-black text-white">{confidence}%</div>
<div className="text-zinc-400">Confidence</div>
</div>
</div>
</div>
</div>
</section>
)}
