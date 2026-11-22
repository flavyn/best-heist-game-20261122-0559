let context,enabled=true;
export function toggleSound(){enabled=!enabled;return enabled;}
export function cue(kind) {
  if(!enabled) return;
  const notes={loot:[660,880,1320],clear:[440,660,880,1320],caught:[160,120,80],coin:[1100,740],jam:[290,390],hide:[210],alert:[490],denied:[110,100]};
  try {
    context ||= new (window.AudioContext||window.webkitAudioContext)();
    context.resume();
    (notes[kind]||[400]).forEach((frequency,i)=>{
      const at=context.currentTime+i*0.09,osc=context.createOscillator(),gain=context.createGain();
      osc.type=kind==='jam'?'triangle':'sine';osc.frequency.value=frequency;
      gain.gain.setValueAtTime(0.0001,at);gain.gain.exponentialRampToValueAtTime(0.065,at+0.01);gain.gain.exponentialRampToValueAtTime(0.0001,at+0.14);
      osc.connect(gain);gain.connect(context.destination);osc.start(at);osc.stop(at+0.15);
    });
  } catch { /* Audio may stay unavailable until a user gesture; play remains silent. */ }
}
