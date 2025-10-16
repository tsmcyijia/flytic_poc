export default function FlightCard({ item }){
  const segs=item.segments||[]
  const parseDur=d=>{const m=d.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);return(m?(parseInt(m[1]||0)*60+parseInt(m[2]||0)):0)}
  const totalMinutes=item.total_flight_minutes||segs.reduce((a,s)=>a+parseDur(s.duration||''),0)
  const totalHours=`${Math.floor(totalMinutes/60)}h ${totalMinutes%60}m`
  const totalTrip=item.total_trip_minutes?`${Math.floor(item.total_trip_minutes/60)}h ${Math.round(item.total_trip_minutes%60)}m`:totalHours
  return(<div style={{border:'1px solid #ddd',borderRadius:8,padding:14,marginBottom:12,background:'#fff'}}>
    <div style={{display:'flex',justifyContent:'space-between'}}>
      <div><div style={{fontWeight:700,fontSize:16}}>{item.origin} → {item.destination}</div>
        <div style={{fontSize:13,color:'#666'}}>出發 {item.departure} → 抵達 {item.arrival}</div>
        <div style={{fontSize:12,color:'#666'}}>總飛行時間：{totalHours} ｜ 總旅行時間：{totalTrip}</div></div>
      <div style={{textAlign:'right'}}><div style={{fontSize:22,fontWeight:700}}>{item.currency} {item.price}</div></div>
    </div>
    <div style={{marginTop:10}}>{segs.map((s,idx)=>{const next=segs[idx+1];let lay=null;if(next){const d1=new Date(s.arrival),d2=new Date(next.departure);const diff=Math.round((d2-d1)/60000);lay=`${Math.floor(diff/60)}h ${diff%60}m`;}
      return(<div key={idx} style={{borderTop:idx?'1px dashed #eee':'none',paddingTop:8,paddingBottom:8}}>
        <div style={{fontWeight:600}}>{s.origin} → {s.destination} {s.carrier}{s.flightNumber&&` ${s.flightNumber}`}</div>
        <div style={{fontSize:13,color:'#555'}}>{s.departure} → {s.arrival} ｜ 飛行時間：{s.duration?.replace('PT','').toLowerCase()}</div>
        {lay&&<div style={{fontSize:12,color:'#999'}}>轉機於 {s.destination}，停留 {lay}</div>}
      </div>)
    })}</div></div>)
}
