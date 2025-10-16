
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import ClassicSearch from './pages/ClassicSearch'; import Agent from './pages/Agent'
import { useEffect, useState } from 'react'
function NavBar(){ const nav=useNavigate(); const [authed,setA]=useState(!!localStorage.getItem('token'));
  useEffect(()=>{const l=()=>setA(!!localStorage.getItem('token')); window.addEventListener('storage',l); return ()=>window.removeEventListener('storage',l)},[])
  return (<div style={{display:'flex',gap:16,alignItems:'center',padding:12,borderBottom:'1px solid #eee'}}>
    <b>F l y t i c</b><Link to="/classic">傳統搜尋</Link><Link to="/agent">AI 助理</Link><span style={{flex:1}}></span>
    {authed? <button onClick={()=>{localStorage.removeItem('token'); nav(0)}}>登出</button> : <><button onClick={()=>nav('/login')}>登入</button><button onClick={()=>nav('/register')}>註冊</button></>}
  </div>)}
function Login(){ const nav=useNavigate(); const [u,setU]=useState(''); const [p,setP]=useState(''); const [m,setM]=useState('');
  const go=async()=>{ setM('登入中...'); const r=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})}); const d=await r.json();
    if(r.ok&&d.token){localStorage.setItem('token',d.token); setM('OK'); nav('/classic')} else setM(d.detail||'登入失敗') }
  return (<div style={{maxWidth:420,margin:'40px auto'}}><h2>登入</h2><div>帳號</div><input value={u} onChange={e=>setU(e.target.value)}/>
    <div>密碼</div><input type="password" value={p} onChange={e=>setP(e.target.value)}/><div style={{marginTop:12}}><button onClick={go}>登入</button></div><div>{m}</div></div>)}
function Register(){ const nav=useNavigate(); const [u,setU]=useState(''); const [p,setP]=useState(''); const [m,setM]=useState('');
  const go=async()=>{ setM('註冊中...'); const r=await fetch('/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})}); const d=await r.json();
    if(r.ok){ setM('註冊成功'); setTimeout(()=>nav('/login'),800)} else setM(d.detail||'註冊失敗') }
  return (<div style={{maxWidth:420,margin:'40px auto'}}><h2>註冊</h2><div>帳號</div><input value={u} onChange={e=>setU(e.target.value)}/>
    <div>密碼</div><input type="password" value={p} onChange={e=>setP(e.target.value)}/><div style={{marginTop:12}}><button onClick={go}>建立帳號</button></div><div>{m}</div></div>)}
export default function App(){ return (<div><NavBar/><div style={{padding:16}}>
  <Routes><Route path="/classic" element={<ClassicSearch/>}/><Route path="/agent" element={<Agent/>}/><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/><Route path="*" element={<Navigate to="/classic" replace/>}/></Routes>
</div></div>)}
