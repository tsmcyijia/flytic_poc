
import { useState } from 'react'; import FlightCard from '../components/FlightCard'
export default function ClassicSearch(){
  const [origin,setO]=useState('TPE'), [destination,setD]=useState('VIE'), [date,setDate]=useState('2026-02-10'), [ret,setRet]=useState('2026-02-20'), [adults,setA]=useState(1)
  const [loading,setL]=useState(false), [results,setR]=useState([]), [msg,setM]=useState('')
  const go = async ()=>{ setL(true); setM('搜尋中...'); setR([])
    const token=localStorage.getItem('token')
    try{
      const r=await fetch('/api/search',{method:'POST',headers:{'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`}:{})}, body:JSON.stringify({origin,destination,depart_date:date,return_date:ret,adults})})
      if(!r.ok){ const t=await r.text(); setM(`查詢失敗(${r.status}) ${t}`); setL(false); return }
      const d=await r.json(); setR(d.results||[]); setM(`共 ${d.results?.length||0} 筆`)
    }catch(e){ setM('網路錯誤：'+String(e)) } finally{ setL(false) }
  }
  return (<div><h2>傳統搜尋</h2>
    <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8,maxWidth:900}}>
      <div><div>出發地</div><input value={origin} onChange={e=>setO(e.target.value.toUpperCase())}/></div>
      <div><div>目的地</div><input value={destination} onChange={e=>setD(e.target.value.toUpperCase())}/></div>
      <div><div>去程</div><input type="date" value={date} onChange={e=>setDate(e.target.value)}/></div>
      <div><div>回程(選填)</div><input type="date" value={ret} onChange={e=>setRet(e.target.value)}/></div>
      <div><div>人數</div><input type="number" min="1" value={adults} onChange={e=>setA(Number(e.target.value||1))}/></div>
    </div>
    <div style={{marginTop:10}}><button onClick={go} disabled={loading}>開始搜尋</button> <span style={{color:'#666'}}>{msg}</span></div>
    <div style={{marginTop:16}}>{results.map((it,idx)=>(<FlightCard key={idx} item={it}/>))}</div>
  </div>)
}
