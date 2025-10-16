
import { useState } from 'react'; import FlightCard from '../components/FlightCard'
export default function Agent(){
  const [messages,setMessages]=useState([{role:'system',content:'你是機票達人助手'}])
  const [input,setInput]=useState('想找 2026/2/10~2/20 從台北到維也納最便宜有哪些？')
  const [cards,setCards]=useState([]); const [loading,setL]=useState(false)
  const send=async()=>{
    if(!input.trim())return
    const nm=[...messages,{role:'user',content:input}]; setMessages(nm); setInput(''); setL(true)
    try{
      const r=await fetch('/api/agent/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:nm})})
      if(!r.ok){ const txt=await r.text().catch(()=> ''); setMessages(m=>[...m,{role:'assistant',content:`（後端錯誤 ${r.status}）${txt || 'Internal Server Error'}`}]); setL(false); return }
      const raw=await r.text(); let d; try{ d=JSON.parse(raw) }catch{ setMessages(m=>[...m,{role:'assistant',content:`（非 JSON 回應）${raw.slice(0,500)}`}]); setL(false); return }
      setMessages(m=>[...m,{role:'assistant',content:d.reply||'(無回覆)'}]); if(d.flights) setCards(d.flights)
    }catch(e){ setMessages(m=>[...m,{role:'assistant',content:`（網路錯誤）${String(e)}`}]) } finally{ setL(false) }
  }
  return (<div style={{display:'grid',gridTemplateColumns:'1.2fr 1fr',gap:16}}>
    <div style={{border:'1px solid #eee',borderRadius:8,padding:12,height:'70vh',display:'flex',flexDirection:'column'}}>
      <div style={{flex:1,overflow:'auto'}}>{messages.filter(m=>m.role!=='system').map((m,idx)=>(
        <div key={idx} style={{margin:'8px 0',textAlign:m.role==='user'?'right':'left'}}>
          <div style={{display:'inline-block',padding:'8px 12px',borderRadius:12, background:m.role==='user'?'#e0f2fe':'#f1f5f9'}}>{m.content}</div>
        </div>))}{loading&&<div style={{color:'#666'}}>助手思考中…</div>}</div>
      <div style={{display:'flex',gap:8}}><input value={input} onChange={e=>setInput(e.target.value)} style={{flex:1}} placeholder="輸入你的旅遊需求..."/><button onClick={send} disabled={loading}>送出</button></div>
    </div>
    <div><h3>建議方案</h3><div>{cards.map((it,idx)=>(<FlightCard key={idx} item={it}/>))}</div></div>
  </div>)
}
